import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './signup.html',
  styleUrl: '../auth/auth.css',
})
export class Signup {
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async signUp() {
    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    if (password !== this.confirmPassword.trim()) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const result = await this.auth.signUp(email, password);

      if (!result) {
        this.errorMessage = 'Unable to create account.';
        return;
      }

      this.router.navigate(['/auth'], {
        queryParams: {
          registered: 'true',
        },
      });
    } catch {
      this.errorMessage = 'Unable to create account.';
    } finally {
      this.isSubmitting = false;
    }
  }

  clearError() {
    this.errorMessage = '';
  }
}
