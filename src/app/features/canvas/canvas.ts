import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { FieldType, FormModel } from '../../main/form-model';

@Component({
  selector: 'app-canvas',
  imports: [CommonModule, FormsModule, DragDropModule, ButtonModule, InputTextModule],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas {
  @Input() fields: FormModel[] = [];
  @Input() selectedField: FormModel | null = null;
  @Input() fieldLabelErrors: Record<string, string> = {};

  @Output() fieldSelected = new EventEmitter<FormModel>();
  @Output() fieldDoubleClicked = new EventEmitter<FormModel>();
  @Output() fieldDropped = new EventEmitter<FieldType>();
  @Output() fieldDeleted = new EventEmitter<FormModel>();
  @Output() fieldLabelChanged = new EventEmitter<FormModel>();
  selectField(field: FormModel) {
    this.fieldSelected.emit(field);
  }

  editField(field: FormModel) {
    this.fieldDoubleClicked.emit(field);
  }

  moveField(index: number, direction: 'up' | 'down', event: MouseEvent) {
    event.stopPropagation();

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= this.fields.length) {
      return;
    }

    moveItemInArray(this.fields, index, newIndex);
  }

  drop(event: CdkDragDrop<FormModel[], unknown, FieldType>) {
    if (event.previousContainer !== event.container) {
      this.fieldDropped.emit(event.item.data);
      return;
    }

    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }

  deleteField(field: FormModel, event: MouseEvent) {
  event.stopPropagation();
  this.fieldDeleted.emit(field);
}
}
