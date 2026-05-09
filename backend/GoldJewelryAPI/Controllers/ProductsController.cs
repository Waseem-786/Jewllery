using GoldJewelryAPI.Data;
using GoldJewelryAPI.DTOs;
using GoldJewelryAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoldJewelryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxImageBytes = 5 * 1024 * 1024; // 5 MB

        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
            [FromQuery] int? categoryId,
            [FromQuery] string? search,
            [FromQuery] bool? featured)
        {
            var query = _context.Products.Include(p => p.Category).AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    p.Description.Contains(search) ||
                    p.Material.Contains(search));

            if (featured.HasValue && featured.Value)
                query = query.Where(p => p.IsFeatured);

            var products = await query
                .OrderByDescending(p => p.IsFeatured)
                .ThenByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(products.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            return Ok(MapToDto(product));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                return BadRequest(new { message = $"Category {dto.CategoryId} not found." });

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl,
                Weight = dto.Weight,
                Material = dto.Material,
                Purity = dto.Purity,
                Badge = dto.Badge,
                Features = dto.Features ?? new List<string>(),
                IsFeatured = dto.IsFeatured,
                CategoryId = dto.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapToDto(product));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            if (product.CategoryId != dto.CategoryId &&
                !await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                return BadRequest(new { message = $"Category {dto.CategoryId} not found." });

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.ImageUrl = dto.ImageUrl;
            product.Weight = dto.Weight;
            product.Material = dto.Material;
            product.Purity = dto.Purity;
            product.Badge = dto.Badge;
            product.Features = dto.Features ?? new List<string>();
            product.IsFeatured = dto.IsFeatured;
            product.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            return Ok(MapToDto(product));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Block deletion if the product is referenced by any order (Restrict cascade)
            if (await _context.OrderItems.AnyAsync(oi => oi.ProductId == id))
                return BadRequest(new { message = "Cannot delete a product that has been ordered." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(MaxImageBytes)]
        public async Task<ActionResult<ImageUploadResponseDto>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (file.Length > MaxImageBytes)
                return BadRequest(new { message = "File too large (max 5 MB)." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedImageExtensions.Contains(ext))
                return BadRequest(new { message = "Unsupported image type." });

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var publicUrl = $"/uploads/{fileName}";
            return Ok(new ImageUploadResponseDto { ImageUrl = publicUrl });
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            ImageUrl = p.ImageUrl,
            Weight = p.Weight,
            Material = p.Material,
            Purity = p.Purity,
            Badge = p.Badge,
            Features = p.Features ?? new List<string>(),
            IsFeatured = p.IsFeatured,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty
        };
    }
}
