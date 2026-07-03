import { TestBed } from '@angular/core/testing';

import { FormBuilder } from './form-builder';

describe('FormBuilder', () => {
  let service: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
