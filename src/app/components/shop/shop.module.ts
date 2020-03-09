import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ShopRoutingModule } from './shop-routing.module';
import { ShopListComponent } from './shop-list/shop-list.component';
import { ShopService } from './services/shop.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShopProductDetailedComponent } from './shop-product-detailed/shop-product-detailed.component';
import { CartComponent } from './cart/cart.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  declarations: [ShopListComponent,ShopProductDetailedComponent,CartComponent,SummaryComponent],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ShopRoutingModule,
  ],
  providers: [ShopService],
  entryComponents: [],
})
export class ShopModule {}
