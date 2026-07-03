import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

export type UserListItem = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  recordsCount?: number;
};

type UsersResponse = {
  error?: boolean;
  data?: UserListItem[] | { users?: UserListItem[]; data?: UserListItem[]; result?: UserListItem[] };
  users?: UserListItem[];
  result?: UserListItem[];
  message?: string;
};

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiUrl = 'https://dragdrop-backend-ies3.onrender.com/api/v1/user';
  private readonly requestTimeoutMs = 8000;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getUsers(): Observable<UserListItem[]> {
    return this.http.get<UsersResponse | UserListItem[]>(`${this.apiUrl}/getAll`, {
      headers: this.authHeaders(),
    }).pipe(
      timeout(this.requestTimeoutMs),
      map(response => this.extractUsers(response))
    );
  }

  createUser(user: { email: string; password: string; role: 'USER' | 'ADMIN' }) {
    return this.http.post(`${this.apiUrl}/create-by-admin`, user, {
      headers: this.authHeaders(),
    }).pipe(timeout(this.requestTimeoutMs));
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.authHeaders(),
    }).pipe(timeout(this.requestTimeoutMs));
  }

  private extractUsers(response: UsersResponse | UserListItem[]) {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.users)) {
      return response.data.users;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.result)) {
      return response.data.result;
    }

    if (Array.isArray(response?.users)) {
      return response.users;
    }

    if (Array.isArray(response?.result)) {
      return response.result;
    }

    return [];
  }

  private authHeaders() {
    const token = this.auth.getToken();

    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : undefined;
  }
}
