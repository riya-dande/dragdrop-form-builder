import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Sidebar } from './features/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public auth: AuthService,
    public router: Router
  ) {}

  showSidebar() {
    const url = this.router.url;

    return this.auth.isSignedIn() &&
      !url.includes('/form-builder') &&
      !url.includes('/designer');
  }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/auth']);
  }
}
