import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormModel } from '../../main/form-model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-properties-panel',
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, InputTextModule],
  templateUrl: './properties-panel.html',
  styleUrl: './properties-panel.css',
})
export class PropertiesPanel {
  @Input() selectedField: FormModel | null = null;

  get showOptions() {
    return this.selectedField?.type === 'checkbox'
      || this.selectedField?.type === 'radio'
      || this.selectedField?.type === 'dropdown';
  }

  get fieldTypeLabel() {
    switch (this.selectedField?.type) {
      case 'text':
        return 'Text Input';
      case 'checkbox':
        return 'Checkbox';
      case 'radio':
        return 'Radio Button';
      case 'dropdown':
        return 'Dropdown';
      case 'date':
        return 'Date';
      case 'number':
        return 'Number';
      default:
        return '';
    }
  }

  get optionsLabel() {
    switch (this.selectedField?.type) {
      case 'checkbox':
        return 'Checkbox Options';
      case 'radio':
        return 'Radio Options';
      case 'dropdown':
        return 'Dropdown Options';
      default:
        return 'Options';
    }
  }

  addOption() {
    if (!this.selectedField || !this.showOptions) {
      return;
    }

    this.selectedField.dropdownItems ??= [];
    this.selectedField.dropdownItems.push('');
  }

  removeOption(index: number) {
    if (!this.selectedField?.dropdownItems) {
      return;
    }

    this.selectedField.dropdownItems.splice(index, 1);
  }

  trackByIndex(index: number) {
    return index;
  }
}
