import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  requestedRole: string | null = null;
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.requestedRole = this.route.snapshot.queryParamMap.get('role');
    this.successMessage =
      this.route.snapshot.queryParamMap.get('registered') === 'true'
        ? 'Account created successfully. Please login.'
        : '';

    if (this.auth.hasRole('admin')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.auth.hasRole('user')) {
      this.router.navigate(['/dashboard']);
    }
  }

  async signIn() {
    try {
      const role = await this.auth.signIn(this.email, this.password);

      if (!role) {
        this.errorMessage = 'Invalid email or password.';
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const fallbackUrl = '/dashboard';

      this.router.navigateByUrl(returnUrl || fallbackUrl);
    } catch {
      this.errorMessage = 'Invalid email or password.';
    }
  }

  clearError() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
