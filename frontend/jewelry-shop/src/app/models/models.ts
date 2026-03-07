export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    weight: number;
    material: string;
    purity: string;
    isFeatured: boolean;
    categoryId: number;
    categoryName: string;
}

export interface Category {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
    productCount: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface AuthResponse {
    token: string;
    fullName: string;
    email: string;
    role: string;
}

export interface PlaceOrderRequest {
    shippingAddress: string;
    items: { productId: number; quantity: number }[];
}

export interface OrderItemResponse {
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface OrderResponse {
    id: number;
    totalAmount: number;
    status: string;
    shippingAddress: string;
    createdAt: string;
    items: OrderItemResponse[];
}
