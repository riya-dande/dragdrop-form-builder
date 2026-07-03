import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppModel } from './app-model';
import { FormApiService } from '../services/form-api';

@Injectable({
  providedIn: 'root',
})
export class AppCatalogService {
  private apps: AppModel[] = [];

  constructor(private formApi: FormApiService) {}

  async loadApps() {
    try {
      this.apps = await firstValueFrom(this.formApi.getApps());
    } catch (error) {
      console.error('Failed to load apps', error);
      throw error;
    }

    return this.apps;
  }

  getApps() {
    return this.apps;
  }

  getAppById(appId: string) {
    return this.apps.find(app => app.id === appId);
  }

  hasAppName(name: string, excludeAppId?: string) {
    const normalizedName = name.trim().toLowerCase();

    return this.apps.some(app =>
      app.id !== excludeAppId &&
      app.name.trim().toLowerCase() === normalizedName
    );
  }

  async createApp(name: string, type: string) {
    if (this.hasAppName(name)) {
      throw new Error('APP_NAME_EXISTS');
    }

    const app = await firstValueFrom(this.formApi.createApp({
      name: name.trim(),
      type,
    }));

    this.apps = [app, ...this.apps];
    return app;
  }

  async updateApp(appId: string, name: string, type: string) {
    if (this.hasAppName(name, appId)) {
      throw new Error('APP_NAME_EXISTS');
    }

    const app = await firstValueFrom(this.formApi.updateApp(appId, {
      name: name.trim(),
      type,
    }));

    this.apps = this.apps.map(existingApp =>
      existingApp.id === app.id ? app : existingApp
    );

    return app;
  }

  async deleteApp(appId: string) {
    await firstValueFrom(this.formApi.deleteApp(appId));
    this.apps = this.apps.filter(app => app.id !== appId);
  }
}
