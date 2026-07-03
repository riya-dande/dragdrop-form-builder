export type FieldType = 'text' | 'date' | 'number' | 'checkbox' | 'radio' | 'dropdown';

export interface FormModel {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  dropdownItems?: string[];
}

export interface FormDesign {
  id: string;
  name: string;
  appId: string;
  fields: FormModel[];
  createdAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: Date;
  values: Record<string, string | boolean | string[]>;
}
