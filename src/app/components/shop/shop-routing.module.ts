import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShopListComponent } from './shop-list/shop-list.component';
import { CartComponent } from './cart/cart.component';
import { ShopProductDetailedComponent } from './shop-product-detailed/shop-product-detailed.component';
import { SummaryComponent } from './summary/summary.component';

const routes: Routes = [
  {
    path: '',
    component: ShopListComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: ':id/detailed',
    component: ShopProductDetailedComponent,
  },
  {
    path:'summary',
    component: SummaryComponent,
  },
  {
    path:':id/summary',
    component: SummaryComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
