import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppCatalogService } from '../../main/app-catalog';
import { AppModel } from '../../main/app-model';
import { FormStateService } from '../../main/form-builder';
import { FormDesign, FormModel, FormResponse } from '../../main/form-model';

@Component({
  selector: 'app-app-forms',
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './app-forms.html',
  styleUrl: './app-forms.css',
})
export class AppForms implements OnInit {
  appId = '';
  app?: AppModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appCatalog: AppCatalogService,
    private formState: FormStateService
  ) {
    this.appId = this.route.snapshot.paramMap.get('appId') ?? '';
  }

  async ngOnInit() {
    await this.appCatalog.loadApps();
    await this.formState.loadForms();
    await this.formState.loadResponses();
    this.app = this.appCatalog.getAppById(this.appId);
  }

  get forms(): FormDesign[] {
    return this.formState.getFormsByApp(this.appId);
  }

  get selectedForm(): FormDesign | undefined {
    return this.forms[0];
  }

  get fields(): FormModel[] {
    return this.selectedForm?.fields ?? [];
  }

  get responses(): FormResponse[] {
    const formIds = new Set(this.forms.map(form => form.id));

    return this.formState
      .getResponses()
      .filter(response => formIds.has(response.formId));
  }

  get createResponseLink() {
    const form = this.selectedForm;

    return form ? ['/apps', this.appId, 'forms', form.id, 'create'] : null;
  }

  openGeneratedForm() {
    const form = this.selectedForm;

    if (!form) {
      return;
    }

    this.formState.setCurrentForm(form);
    this.router.navigate(['/apps', this.appId, 'forms', form.id, 'create']);
  }

  formatValue(response: FormResponse, field: FormModel) {
    const responseForm = this.forms.find(form => form.id === response.formId);
    const responseField = responseForm?.fields.find(item =>
      item.id === field.id ||
      (item.label.trim().toLowerCase() === field.label.trim().toLowerCase() && item.type === field.type)
    );
    const value = responseField
      ? this.getResponseValue(response, responseField)
      : undefined;

    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (field.type === 'date') {
      return this.formatDateInIst(value);
    }

    return String(value ?? '').trim();
  }

  getEditResponseLink(response: FormResponse) {
    return ['/apps', this.appId, 'forms', response.formId, 'responses', response.id, 'edit'];
  }

  getViewResponseLink(response: FormResponse) {
    return ['/apps', this.appId, 'forms', response.formId, 'responses', response.id, 'view'];
  }

  async deleteResponse(responseId: string) {
    await this.formState.deleteResponse(responseId);
  }

  private formatDateInIst(value: unknown) {
    if (!value) {
      return '';
    }

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value).trim();
    }

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private getResponseValue(response: FormResponse, field: FormModel) {
    return response.values[field.id] ??
      response.values[field.label] ??
      response.values[field.label.trim().toLowerCase()];
  }
}
