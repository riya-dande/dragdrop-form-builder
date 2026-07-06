import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './reset-password.html',
  styleUrl: '../auth/auth.css',
})
export class ResetPassword {
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  private readonly token: string | null = null;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.token =
      this.route.snapshot.queryParamMap.get('token') ||
      this.route.snapshot.queryParamMap.get('resetToken') ||
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.paramMap.get('token');

    if (!this.token) {
      this.errorMessage = 'Reset link is invalid or expired.';
    }
  }

  async resetPassword() {
    const password = this.password.trim();
    const confirmPassword = this.confirmPassword.trim();

    if (!this.token) {
      this.errorMessage = 'Reset link is invalid or expired.';
      return;
    }

    if (!password || !confirmPassword) {
      this.errorMessage = 'Password and confirmation are required.';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      this.successMessage = await this.auth.resetPassword(this.token, password);
      setTimeout(() => this.router.navigate(['/auth']), 1500);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to reset password. Please request a new reset link.';
    } finally {
      this.isSubmitting = false;
    }
  }

  clearMessage() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
