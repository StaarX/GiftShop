import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopProductDetailedComponent } from './shop-product-detailed.component';

describe('ProductsListComponent', () => {
  let component: ShopProductDetailedComponent;
  let fixture: ComponentFixture<ShopProductDetailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopProductDetailedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopProductDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
