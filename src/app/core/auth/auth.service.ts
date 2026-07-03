import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'https://dragdrop-backend-ies3.onrender.com/api/v1/user';
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

}
