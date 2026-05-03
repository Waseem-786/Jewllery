import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss'],
})
export class Signin {

  email: string = '';
  password: string = '';

  login() {
    console.log('Login:', this.email, this.password);
  }
}