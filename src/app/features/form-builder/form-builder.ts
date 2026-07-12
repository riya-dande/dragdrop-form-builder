import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormStateService} from '../../main/form-builder';
import { Toolbox } from '../toolbox/toolbox';
import { Canvas } from '../canvas/canvas';
import { PropertiesPanel } from '../properties-panel/properties-panel';
import { FormsModule } from '@angular/forms';
import { FieldType, FormModel } from '../../main/form-model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AppCatalogService } from '../../main/app-catalog';
@Component({
  selector: 'app-form-builder',
  imports: [CommonModule, Toolbox, Canvas, PropertiesPanel, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
})

export class FormBuilder {
  fields: FormModel[] = [];
  fieldLabelErrors: Record<string, string> = {};
  appId: string | null = null;

  selectedField: FormModel | null = null;

  constructor(
    private formState: FormStateService,
    private appCatalog: AppCatalogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.appId = this.route.snapshot.paramMap.get('appId');

    const form = this.appId ? this.formState.getFormByApp(this.appId) : this.formState.getCurrentForm();

    if (form && (!this.appId || form.appId === this.appId)) {
      this.formName = form.name;
      this.fields = structuredClone(form.fields);
    } else if (this.appId) {
      this.formName = this.appCatalog.getAppById(this.appId)?.name ?? '';
    }
  }

  addField(type: FieldType) {
    const newField: FormModel = {
      id: `${Date.now()}`,
      type,
      label: '',
      placeholder: this.getDefaultPlaceholder(type),
      required: false,
      dropdownItems: this.hasOptions(type) ? ['', ''] : undefined
    };


    this.fields.push(newField);
    this.selectedField = newField;
  }

  selectField(field: FormModel) {
    this.selectedField = field;
  }

  formName = '';
  formNameError = '';
  isSaving = false;

  async saveForm() {
    const trimmedName = this.formName.trim();

    if (!trimmedName) {
      this.formNameError = 'Form name is required.';
      return;
    }

    if (!this.validateFieldLabels()) {
      return;
    }

    this.formNameError = '';
    this.isSaving = true;

    try {
      if (!this.appId && this.appCatalog.hasAppName(trimmedName)) {
        this.formNameError = 'An app with this name already exists.';
        return;
      }

      const appId = this.appId ?? (await this.appCatalog.createApp(trimmedName, 'Collab')).id;

      await this.formState.saveFormDesign(trimmedName, this.getFieldsForSave(), appId);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.formNameError = error instanceof Error && error.message === 'APP_NAME_EXISTS'
        ? 'An app with this name already exists.'
        : 'Unable to save form.';
    } finally {
      this.isSaving = false;
    }
  }

  deleteField(field: FormModel) {
  this.fields = this.fields.filter(item => item.id !== field.id);
  delete this.fieldLabelErrors[field.id];

  if (this.selectedField?.id === field.id) {
    this.selectedField = null;
    }
  }

  clearFieldLabelError(field: FormModel) {
    if (field.label.trim()) {
      delete this.fieldLabelErrors[field.id];
    }
  }

  closeForm() {
    this.router.navigate(this.appId ? ['/apps', this.appId, 'forms'] : ['/dashboard']);
  }

  getDefaultPlaceholder(_type: FieldType): string {
    return '';
  }

  private hasOptions(type: FieldType) {
    return type === 'checkbox' || type === 'radio' || type === 'dropdown';
  }

  private validateFieldLabels() {
    this.fieldLabelErrors = {};

    for (const field of this.fields) {
      if (!field.label.trim()) {
        this.fieldLabelErrors[field.id] = 'Label is required.';
      }
    }

    return Object.keys(this.fieldLabelErrors).length === 0;
  }

  private getFieldsForSave() {
    return this.fields.map(field => ({
      ...field,
      label: field.label.trim(),
    }));
  }
}
