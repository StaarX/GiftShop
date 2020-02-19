import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsService } from './services/products.service';
import { ProductsEditComponent } from './products-edit/products-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ProductsListComponent, ProductsEditComponent],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ProductsRoutingModule,
  ],
  providers: [ProductsService],
  entryComponents: [],
})
export class ProductsModule {}
