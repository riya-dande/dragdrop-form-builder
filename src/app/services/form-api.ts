import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { AppModel } from '../main/app-model';
import { FieldType, FormDesign, FormModel, FormResponse } from '../main/form-model';

export interface SaveFormRequest {
  appId?: string;
  name: string;
  fields: FormModel[];
}

export interface SaveResponseRequest {
  values: Record<string, string | boolean | string[]>;
}

export interface SaveAppRequest {
  name: string;
  type: string;
}

type RawFormControl = Partial<FormModel> & {
  controlKey?: string;
  fieldKey?: string;
};

type RawFormDesign = Partial<FormDesign> & {
  fields?: RawFormControl[];
  dataControls?: RawFormControl[];
  controls?: RawFormControl[];
};

type RawFormResponse = Partial<FormResponse> & {
  values?: Record<string, string | boolean | string[]> | RawResponseValue[];
};

type RawResponseValue = {
  fieldId?: string;
  dataControlId?: string;
  value?: string | boolean | string[];
  field?: {
    id?: string;
    controlKey?: string;
    fieldKey?: string;
  };
  dataControl?: {
    id?: string;
    controlKey?: string;
    fieldKey?: string;
  };
};

@Injectable({
  providedIn: 'root',
})
export class FormApiService {
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly requestTimeoutMs = 8000;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  healthCheck(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`).pipe(timeout(this.requestTimeoutMs));
  }

  createApp(app: SaveAppRequest): Observable<AppModel> {
    return this.http.post<AppModel>(`${this.apiUrl}/apps`, app, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  getApps(): Observable<AppModel[]> {
    return this.http.get<AppModel[]>(`${this.apiUrl}/apps`, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  updateApp(id: string, app: SaveAppRequest): Observable<AppModel> {
    return this.http.put<AppModel>(`${this.apiUrl}/apps/${id}`, app, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  deleteApp(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/apps/${id}`, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  createForm(form: SaveFormRequest): Observable<FormDesign> {
    return this.http.post<RawFormDesign>(`${this.apiUrl}/forms`, this.toFormPayload(form), this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(formDesign => this.normalizeForm(formDesign))
    );
  }

  getCurrentForm(): Observable<FormDesign> {
    return this.http.get<RawFormDesign>(`${this.apiUrl}/forms/current`, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(formDesign => this.normalizeForm(formDesign))
    );
  }

  getForms(): Observable<FormDesign[]> {
    return this.http.get<RawFormDesign[]>(`${this.apiUrl}/forms`, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(forms => forms.map(formDesign => this.normalizeForm(formDesign)))
    );
  }

  updateForm(id: string, form: SaveFormRequest): Observable<FormDesign> {
    return this.http.put<RawFormDesign>(`${this.apiUrl}/forms/${id}`, this.toFormPayload(form), this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(formDesign => this.normalizeForm(formDesign))
    );
  }

  deleteForm(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/forms/${id}`, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  createResponse(formId: string, response: SaveResponseRequest): Observable<FormResponse> {
    return this.http.post<RawFormResponse>(`${this.apiUrl}/forms/${formId}/responses`, response, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(savedResponse => this.normalizeResponse(savedResponse))
    );
  }

  getResponses(): Observable<FormResponse[]> {
    return this.http.get<RawFormResponse[]>(`${this.apiUrl}/responses`, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(responses => responses.map(response => this.normalizeResponse(response)))
    );
  }

  getResponsesByFormId(formId: string): Observable<FormResponse[]> {
    return this.http.get<RawFormResponse[]>(`${this.apiUrl}/forms/${formId}/responses`, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(responses => responses.map(response => this.normalizeResponse(response)))
    );
  }

  updateResponse(responseId: string, response: SaveResponseRequest): Observable<FormResponse> {
    return this.http.put<RawFormResponse>(`${this.apiUrl}/responses/${responseId}`, response, this.authOptions()).pipe(
      timeout(this.requestTimeoutMs),
      map(savedResponse => this.normalizeResponse(savedResponse))
    );
  }

  deleteResponse(responseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/responses/${responseId}`, this.authOptions()).pipe(timeout(this.requestTimeoutMs));
  }

  private authOptions() {
    const token = this.auth.getToken();

    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private toFormPayload(form: SaveFormRequest) {
    const fields = form.fields.map(field => ({
      ...field,
      controlKey: field.id,
    }));

    return {
      ...form,
      fields,
      dataControls: fields,
    };
  }

  private normalizeForm(form: RawFormDesign): FormDesign {
    const controls = form.fields ?? form.dataControls ?? form.controls ?? [];

    return {
      id: String(form.id ?? ''),
      name: String(form.name ?? ''),
      appId: String(form.appId ?? ''),
      createdAt: String(form.createdAt ?? ''),
      fields: controls.map((control, index) => this.normalizeControl(control, index)),
    };
  }

  private normalizeControl(control: RawFormControl, index: number): FormModel {
    return {
      id: String(control.id ?? control.controlKey ?? control.fieldKey ?? `field_${index + 1}`),
      type: this.normalizeFieldType(control.type),
      label: String(control.label ?? ''),
      placeholder: control.placeholder ?? '',
      required: control.required ?? false,
      dropdownItems: Array.isArray(control.dropdownItems)
        ? control.dropdownItems.map(item => String(item))
        : undefined,
    };
  }

  private normalizeFieldType(type: unknown): FieldType {
    const fieldType = String(type ?? 'text').toLowerCase();

    if (fieldType === 'date' || fieldType === 'number' || fieldType === 'checkbox' || fieldType === 'dropdown') {
      return fieldType;
    }

    return 'text';
  }

  private normalizeResponse(response: RawFormResponse): FormResponse {
    return {
      id: String(response.id ?? ''),
      formId: String(response.formId ?? ''),
      submittedAt: response.submittedAt ? new Date(response.submittedAt) : new Date(),
      values: this.normalizeResponseValues(response.values),
    };
  }

  private normalizeResponseValues(values: RawFormResponse['values']) {
    if (!values) {
      return {};
    }

    if (!Array.isArray(values)) {
      return values;
    }

    return Object.fromEntries(
      values.flatMap(item => {
        const key =
          item.field?.id ??
          item.dataControl?.id ??
          item.dataControlId ??
          item.fieldId ??
          item.field?.controlKey ??
          item.dataControl?.controlKey ??
          item.field?.fieldKey ??
          item.dataControl?.fieldKey;

        return key ? [[key, item.value ?? '']] : [];
      })
    );
  }
}
