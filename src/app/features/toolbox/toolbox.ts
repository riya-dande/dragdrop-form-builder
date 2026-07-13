import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FieldType } from '../../main/form-model';

@Component({
  selector: 'app-toolbox',
  imports: [CommonModule, DragDropModule],
  templateUrl: './toolbox.html',
  styleUrl: './toolbox.css',
})
export class Toolbox {
  @Output() fieldAdded = new EventEmitter<FieldType>();

  toolboxItems: { type: FieldType; label: string }[] = [
    { type: 'text', label: 'Text Input' },
    { type: 'date', label: 'Date' },
    { type: 'number', label: 'Number' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'dropdown', label: 'Dropdown' }
  ];

  addField(type: FieldType) {
    this.fieldAdded.emit(type);
  }
}

