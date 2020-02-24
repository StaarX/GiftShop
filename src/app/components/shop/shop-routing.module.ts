import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShopListComponent } from './shop-list/shop-list.component';

const routes: Routes = [
  {
    path: '',
    component: ShopListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
