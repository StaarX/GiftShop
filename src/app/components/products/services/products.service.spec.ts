import { TestBed } from '@angular/core/testing';

import { ExamplesService } from './products.service';

describe('ExamplesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExamplesService = TestBed.get(ExamplesService);
    expect(service).toBeTruthy();
  });
});
