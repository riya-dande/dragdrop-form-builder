import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormDesign, FormModel } from '../../main/form-model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { FormStateService } from '../../main/form-builder';
import { AppCatalogService } from '../../main/app-catalog';

@Component({
  selector: 'app-generated-form',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    InputTextModule,
    RadioButtonModule,
    SelectModule,
    RouterLink,
  ],
  templateUrl: './generated-form.html',
  styleUrl: './generated-form.css',
})
export class GeneratedForm implements OnInit{

  form?: FormDesign;
  values: Record<string, string | boolean | string[]> = {};
  fieldErrors: Record<string, string> = {};
  responseCount = 0;
  submitted = false;
  submitError = '';
  isSubmitting = false;
  forms: FormDesign[] = [];
  formsError = '';
  isLoadingForms = true;
  isLoadingCurrentForm = true;
  appId: string | null = null;
  routeFormId: string | null = null;
  responseId: string | null = null;
  mode: 'create' | 'edit' | 'view' = 'create';
  appName = 'App';

  constructor(
    private formState: FormStateService,
    private appCatalog: AppCatalogService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {
    const appId = this.route.snapshot.paramMap.get('appId');
    const formId = this.route.snapshot.paramMap.get('formId');
    const responseId = this.route.snapshot.paramMap.get('responseId');

    this.appId = appId;
    this.routeFormId = formId;
    this.responseId = responseId;
    this.mode = this.router.url.endsWith('/view') ? 'view' : this.responseId ? 'edit' : 'create';
    this.appName = this.appId ? this.appCatalog.getAppById(this.appId)?.name ?? 'App' : 'App';
  }

  async ngOnInit() {
    this.isLoadingCurrentForm = true;
    this.isLoadingForms = true;
    this.formsError = '';
    this.loadForms();
    this.loadCurrentForm();

    try {
      await this.appCatalog.loadApps();
      this.appName = this.appId ? this.appCatalog.getAppById(this.appId)?.name ?? 'App' : 'App';
    } catch {
      this.formsError = 'Unable to load apps.';
    }

    try {
      await this.formState.loadForms();
      this.loadForms();
      this.loadCurrentForm();
    } catch {
      this.form = undefined;
      this.forms = [];
      this.formsError = 'Unable to load saved forms.';
      this.isLoadingCurrentForm = false;
      this.isLoadingForms = false;
    } finally {
      this.isLoadingCurrentForm = false;
      this.isLoadingForms = false;
      this.changeDetector.detectChanges();
    }

    try {
      await this.formState.loadResponses();
      if (this.form) {
        this.loadResponseCount(this.form.id);
      }
    } catch {
      this.submitError = 'Saved forms loaded, but responses could not be loaded.';
    } finally {
      this.changeDetector.detectChanges();
    }
  }

  loadCurrentForm() {
    this.isLoadingCurrentForm = true;
    this.form = this.findRouteForm();

    if (this.form) {
      this.formState.setCurrentForm(this.form);
      this.resetValues();
      this.loadResponseValues();
      this.loadResponseCount(this.form.id);
    }

    this.isLoadingCurrentForm = false;
  }

  loadForms() {
    this.isLoadingForms = true;
    this.formsError = '';
    this.forms = this.appId
      ? this.formState.getFormsByApp(this.appId)
      : this.formState.getForms();
    this.isLoadingForms = false;
  }

  loadResponseCount(formId: string) {
    this.responseCount = this.formState.getResponsesByFormId(formId).length;
  }

  openSavedForm(form: FormDesign) {
    this.form = form;
    this.formState.setCurrentForm(form);
    this.resetValues();
    this.loadResponseCount(form.id);
    this.submitted = false;
    this.submitError = '';
  }

  async submitForm() {
    if (!this.form || this.mode === 'view') {
      return;
    }

    if (!this.validateRequiredFields()) {
      this.submitted = false;
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      if (this.mode === 'edit' && this.responseId) {
        await this.formState.updateResponse(this.responseId, structuredClone(this.values));
      } else {
        await this.formState.saveResponse(structuredClone(this.values));
        this.responseCount += 1;
      }
      this.submitted = true;

      if (this.appId) {
        this.router.navigate(['/apps', this.appId, 'forms']);
      }
    } catch {
      this.submitted = false;
      this.submitError = 'Unable to submit response.';
    } finally {
      this.isSubmitting = false;
    }
  }

  clearFieldError(fieldId: string) {
    delete this.fieldErrors[fieldId];
  }

  private validateRequiredFields() {
    if (!this.form) {
      return false;
    }

    this.fieldErrors = {};

    for (const field of this.form.fields) {
      if (this.isRequiredMissing(field)) {
        this.fieldErrors[field.id] = 'This required field must be entered.';
      }
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  private isRequiredMissing(field: FormModel) {
    if (!field.required) {
      return false;
    }

    const value = this.values[field.id];

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'boolean') {
      return !value;
    }

    return String(value ?? '').trim().length === 0;
  }

  private resetValues() {
    if (!this.form) {
      return;
    }

    this.values = {};
    this.fieldErrors = {};

    for (const field of this.form.fields) {
      this.values[field.id] = field.type === 'checkbox' ? [] : '';
    }
  }

  private loadResponseValues() {
    if (!this.responseId) {
      return;
    }

    const response = this.formState.getResponseById(this.responseId);

    if (response) {
      this.values = structuredClone(response.values);
    }
  }

  private findRouteForm() {
    if (this.routeFormId) {
      const form = this.formState.getFormById(this.routeFormId);

      if (!form || (this.appId && form.appId !== this.appId)) {
        return undefined;
      }

      return form;
    }

    if (this.appId) {
      return this.formState.getFormByApp(this.appId);
    }

    return this.formState.getCurrentForm() ?? this.formState.getForms()[0];
  }
}
