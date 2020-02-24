import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ShopRoutingModule } from './shop-routing.module';
import { ShopListComponent } from './shop-list/shop-list.component';
import { ShopService } from './services/shop.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ShopListComponent],
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
