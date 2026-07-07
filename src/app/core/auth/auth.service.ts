import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { getApiBaseUrl } from '../api-config';

export type UserRole = 'admin' | 'user';

interface LoginResponse {
  error: boolean;
  data: {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
    token: string;
  };
  message: string;
}

interface SignupResponse {
  error: boolean;
  data: {
    id: string;
    email: string;
  };
  message: string;
}

interface PasswordResetResponse {
  error?: boolean;
  data?: {
    resetLink?: string | null;
  } | null;
  message?: string;
}

export type PasswordResetRequestResult = {
  message: string;
  resetLink: string | null;
};

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly apiUrl = `${getApiBaseUrl()}/api/v1/user`;
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'auth_role';
  private readonly emailKey = 'auth_email';
  private currentRole: UserRole | null = null;
  private currentEmail: string | null = null;

  constructor(private http: HttpClient) {
    this.currentRole = this.getStoredRole();
    this.currentEmail = this.readStorage(this.emailKey);
  }

  async signIn(email: string, password: string) {
    const response = await firstValueFrom(this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    }));

    if (response.error || !response.data?.token) {
      return null;
    }

    this.currentRole = response.data.role.toLowerCase() as UserRole;
    this.currentEmail = response.data.email;
    this.writeStorage(this.tokenKey, response.data.token);
    this.writeStorage(this.roleKey, this.currentRole);
    this.writeStorage(this.emailKey, this.currentEmail);

    return this.currentRole;
  }

  async signUp(email: string, password: string) {
    const response = await firstValueFrom(this.http.post<SignupResponse>(`${this.apiUrl}/create`, {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    }));

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  async requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
    const payload = {
      email: email.trim().toLowerCase(),
    };

    try {
      const response = await firstValueFrom(
        this.http.post<PasswordResetResponse>(`${this.apiUrl}/forgot-password`, payload).pipe(
          timeout(15000)
        )
      );

      if (response.error) {
        throw new Error(response.message || 'Unable to send reset instructions.');
      }

      return {
        message: response.message || 'Password reset instructions have been sent to your email.',
        resetLink: response.data?.resetLink || null,
      };
    } catch (error) {
      throw new Error(this.getApiErrorMessage(error, 'Unable to send reset instructions.'));
    }
  }

  async resetPassword(token: string, password: string) {
    const payloads = [
      {
        token,
        password: password.trim(),
      },
      {
        resetToken: token,
        password: password.trim(),
      },
      {
        token,
        newPassword: password.trim(),
      },
    ];
    const endpoints = ['reset-password', 'resetPassword', 'change-password'];
    let lastError: unknown;

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          const response = await firstValueFrom(
            this.http.post<PasswordResetResponse>(`${this.apiUrl}/${endpoint}`, payload)
          );

          if (response.error) {
            lastError = new Error(response.message || 'Unable to reset password.');
            continue;
          }

          return response.message || 'Password updated successfully. Please login.';
        } catch (error) {
          lastError = new Error(this.getApiErrorMessage(error, 'Unable to reset password.'));
        }
      }
    }

    throw lastError;
  }

  signOut() {
    this.currentRole = null;
    this.currentEmail = null;
    this.removeStorage(this.tokenKey);
    this.removeStorage(this.roleKey);
    this.removeStorage(this.emailKey);
  }

  getRole() {
    return this.currentRole;
  }

  hasRole(role: UserRole) {
    return this.currentRole === role;
  }

  getEmail() {
    return this.currentEmail;
  }

  getToken() {
    return this.readStorage(this.tokenKey);
  }

  isSignedIn() {
    return this.currentRole !== null && this.getToken() !== null;
  }

  private getStoredRole() {
    const role = this.readStorage(this.roleKey);
    return role === 'admin' || role === 'user' ? role : null;
  }

  private readStorage(key: string) {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  }

  private writeStorage(key: string, value: string) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(key, value);
  }

  private removeStorage(key: string) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(key);
  }

  private getApiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;

      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return `${fallback} Server says: ${apiMessage}.`;
      }
    }

    return fallback;
  }

}
