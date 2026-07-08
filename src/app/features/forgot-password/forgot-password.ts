import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';
import { gmailOnlyMessage, isGmailAddress } from '../../core/gmail-validation';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth/auth.css',
})
export class ForgotPassword {
  email = '';
  errorMessage = '';
  successMessage = '';
  resetLink: string | null = null;
  isSubmitting = false;
  emailSent = false;
  private readonly gmailUrl = 'https://mail.google.com/mail/u/0/#inbox';

  constructor(private auth: AuthService) {}

  async requestReset() {
    const email = this.email.trim();

    if (!email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!isGmailAddress(email)) {
      this.errorMessage = gmailOnlyMessage;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetLink = null;
    this.emailSent = false;

    try {
      const result = await this.auth.requestPasswordReset(email);

      this.successMessage = result.message;
      this.resetLink = result.resetLink;
      this.emailSent = true;

      if (!this.resetLink) {
        setTimeout(() => this.openGmail(), 1200);
      }
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to send reset instructions. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  clearMessage() {
    this.errorMessage = '';
    this.successMessage = '';
    this.resetLink = null;
    this.emailSent = false;
  }

  openGmail() {
    window.location.assign(this.gmailUrl);
  }

  openResetPage() {
    if (!this.resetLink) {
      return;
    }

    window.location.assign(this.resetLink);
  }
}
