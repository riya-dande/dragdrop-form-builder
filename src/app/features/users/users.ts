import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { gmailOnlyMessage, isGmailAddress } from '../../core/gmail-validation';
import { isStrongPassword, strongPasswordMessage } from '../../core/password-validation';
import { UserApiService, UserListItem } from '../../services/user-api';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: UserListItem[] = [];
  isLoading = true;
  isCreating = false;
  deletingUserId = '';
  showCreateForm = false;
  errorMessage = '';
  createMessage = '';
  createError = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserRole: 'USER' | 'ADMIN' = 'USER';

  constructor(
    private userApi: UserApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userApi.getUsers().subscribe({
      next: (users) => {
        this.users = [...users];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Unable to load users.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  async createUser() {
    const email = this.newUserEmail.trim().toLowerCase();
    const password = this.newUserPassword.trim();

    if (!email || !password) {
      this.createError = 'Email and password are required.';
      return;
    }

    if (!isGmailAddress(email)) {
      this.createError = gmailOnlyMessage;
      return;
    }

    if (!isStrongPassword(password)) {
      this.createError = strongPasswordMessage;
      return;
    }

    this.isCreating = true;
    this.createError = '';
    this.createMessage = '';

    try {
      await firstValueFrom(this.userApi.createUser({
        email,
        password,
        role: this.newUserRole,
      }));

      this.createMessage = 'User created successfully.';
      this.newUserEmail = '';
      this.newUserPassword = '';
      this.newUserRole = 'USER';
      this.loadUsers();
    } catch (error: any) {
      this.createError = error?.error?.message || error?.message || 'Unable to create user.';
    } finally {
      this.isCreating = false;
    }
  }

  async deleteUser(user: UserListItem) {
    if (!user.isActive || this.deletingUserId) {
      return;
    }

    this.deletingUserId = user.id;
    this.errorMessage = '';

    try {
      await firstValueFrom(this.userApi.deleteUser(user.id));
      this.loadUsers();
    } catch (error: any) {
      this.errorMessage = error?.error?.message || error?.message || 'Unable to delete user.';
    } finally {
      this.deletingUserId = '';
    }
  }
}
