import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';
import { AppCatalogService } from '../../main/app-catalog';
import { AppModel } from '../../main/app-model';
import { FormStateService } from '../../main/form-builder';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  apps: AppModel[] = [];
  filteredApps: AppModel[] = [];
  searchText = '';
  errorMessage = '';
  openMenuAppId = '';

  constructor(
    public auth: AuthService,
    private appCatalog: AppCatalogService,
    private formState: FormStateService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadDashboardApps();
  }

  async loadDashboardApps() {
    this.errorMessage = '';

    try {
      this.apps = await this.appCatalog.loadApps();
      this.applySearchFilter();
    } catch (error: any) {
      this.apps = [];
      this.applySearchFilter();
      this.errorMessage = error?.error?.message || error?.message || 'Unable to load apps.';
    }

    try {
      await this.formState.loadForms();
    } catch (error: any) {
      this.errorMessage = this.errorMessage || error?.error?.message || error?.message || 'Unable to load forms.';
    }

    this.changeDetector.detectChanges();
  }

  onSearch() {
    this.applySearchFilter();
  }

  private applySearchFilter() {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      this.filteredApps = [...this.apps];
      return;
    }

    this.filteredApps = this.apps.filter(app =>
      [app.name, app.type, app.createdAt].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  }

  openApp(appId: string) {
    this.router.navigate(['/apps', appId, 'forms']);
  }

  openDesigner(appId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/apps', appId, 'designer']);
  }

  viewFormBuilder(appId: string, event: Event) {
    this.openMenuAppId = '';
    this.openDesigner(appId, event);
  }

  toggleAppMenu(appId: string, event: Event) {
    event.stopPropagation();
    this.openMenuAppId = this.openMenuAppId === appId ? '' : appId;
  }

  async editApp(app: AppModel, event: Event) {
    event.stopPropagation();
    this.openMenuAppId = '';

    const nextName = window.prompt('Edit app name', app.name)?.trim();

    if (!nextName || nextName === app.name) {
      return;
    }

    try {
      await this.appCatalog.updateApp(app.id, nextName, app.type);
      this.apps = this.appCatalog.getApps();
      this.applySearchFilter();
    } catch (error: any) {
      this.errorMessage = error?.message === 'APP_NAME_EXISTS'
        ? 'An app with this name already exists.'
        : error?.error?.message || error?.message || 'Unable to update app.';
    }
  }

  async deleteApp(appId: string, event: Event) {
    event.stopPropagation();
    this.openMenuAppId = '';
    await this.formState.deleteFormsByApp(appId);
    await this.appCatalog.deleteApp(appId);
    this.apps = this.appCatalog.getApps();
    this.applySearchFilter();
  }

  getFormsCount(appId: string) {
    return this.formState.getFormsByApp(appId).length;
  }

  createApp() {
    this.router.navigate(['/admin/form-builder']);
  }

  formatAppDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).replace(/\//g, '.');
  }
}
