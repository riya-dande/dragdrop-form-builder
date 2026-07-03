import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedForm } from './generated-form';

describe('GeneratedForm', () => {
  let component: GeneratedForm;
  let fixture: ComponentFixture<GeneratedForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratedForm],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratedForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
