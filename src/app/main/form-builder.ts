import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormDesign, FormModel, FormResponse } from './form-model';
import { FormApiService } from '../services/form-api';

@Injectable({
  providedIn: 'root',
})
export class FormStateService {
  private currentForm: FormDesign | null = null;
  private forms: FormDesign[] = [];
  private responses: FormResponse[] = [];

  constructor(private formApi: FormApiService) {}

  async loadForms() {
    this.forms = await firstValueFrom(this.formApi.getForms());
    return this.forms;
  }

  async loadResponses() {
    this.responses = await firstValueFrom(this.formApi.getResponses());
    return this.responses;
  }

  async saveFormDesign(name: string, fields: FormModel[], appId: string) {
    let existingForm = this.getFormByApp(appId);

    if (!existingForm) {
      await this.loadForms();
      existingForm = this.getFormByApp(appId);
    }

    const payload = {
      appId,
      name: name.trim(),
      fields: this.mergeFieldIds(existingForm?.fields ?? [], fields),
    };
    const savedForm = existingForm
      ? await firstValueFrom(this.formApi.updateForm(existingForm.id, payload))
      : await firstValueFrom(this.formApi.createForm(payload));

    this.currentForm = savedForm;
    this.forms = [
      savedForm,
      ...this.forms.filter(form => form.appId !== appId || form.id === savedForm.id)
        .filter(form => form.id !== savedForm.id),
    ];

    return savedForm.id;
  }

  async updateFormDesign(id: string, name: string, fields: FormModel[]) {
    const existingForm = this.getFormById(id);
    const savedForm = await firstValueFrom(this.formApi.updateForm(id, {
      appId: existingForm?.appId,
      name,
      fields: this.mergeFieldIds(existingForm?.fields ?? [], fields),
    }));

    this.currentForm = savedForm;
    this.forms = [savedForm, ...this.forms.filter(form => form.id !== savedForm.id)];
    return savedForm.id;
  }

  async loadCurrentForm() {
    if (!this.currentForm) {
      this.currentForm = await firstValueFrom(this.formApi.getCurrentForm());
    }

    return this.currentForm;
  }

  setCurrentForm(form: FormDesign | null) {
    this.currentForm = form;
  }

  getForms() {
    return this.forms;
  }

  getFormsByApp(appId: string) {
    const form = this.getFormByApp(appId);

    return form ? [form] : [];
  }

  getFormByApp(appId: string) {
    return this.forms.find(form => form.appId === appId);
  }

  hasFormName(appId: string, name: string, excludeFormId?: string) {
    const normalizedName = name.trim().toLowerCase();

    return this.forms.some(form =>
      form.appId === appId &&
      form.id !== excludeFormId &&
      form.name.trim().toLowerCase() === normalizedName
    );
  }

  getCurrentForm() {
    return this.currentForm;
  }

  getFormById(id: string) {
    return this.forms.find(form => form.id === id);
  }

  async deleteForm(id: string) {
    await firstValueFrom(this.formApi.deleteForm(id));

    if (this.currentForm?.id === id) {
      this.currentForm = null;
    }

    this.forms = this.forms.filter(form => form.id !== id);
    this.responses = this.responses.filter(response => response.formId !== id);
  }

  async deleteFormsByApp(appId: string) {
    const form = this.getFormByApp(appId);

    if (form) {
      await this.deleteForm(form.id);
    }
  }

  async saveResponse(values: Record<string, string | boolean | string[]>) {
    if (!this.currentForm) {
      return;
    }

    const savedResponse = await firstValueFrom(this.formApi.createResponse(this.currentForm.id, {
      values: structuredClone(values),
    }));

    this.responses = [savedResponse, ...this.responses];
  }

  async updateResponse(responseId: string, values: Record<string, string | boolean | string[]>) {
    const savedResponse = await firstValueFrom(this.formApi.updateResponse(responseId, {
      values: structuredClone(values),
    }));

    this.responses = this.responses.map(response =>
      response.id === responseId ? savedResponse : response
    );
  }

  async deleteResponse(responseId: string) {
    await firstValueFrom(this.formApi.deleteResponse(responseId));
    this.responses = this.responses.filter(response => response.id !== responseId);
  }

  getResponses() {
    return this.responses;
  }

  getResponseById(responseId: string) {
    return this.responses.find(response => response.id === responseId);
  }

  getResponsesByFormId(formId: string) {
    return this.responses.filter(response => response.formId === formId);
  }

  private mergeFieldIds(existingFields: FormModel[], nextFields: FormModel[]) {
    return nextFields.map(field => {
      const matchingField = existingFields.find(existingField =>
        existingField.id === field.id ||
        (
          existingField.label.trim().toLowerCase() === field.label.trim().toLowerCase() &&
          existingField.type === field.type
        )
      );

      return {
        ...structuredClone(field),
        id: matchingField?.id ?? field.id,
      };
    });
  }
}
