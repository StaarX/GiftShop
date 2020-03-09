import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './shared/components/layout/layout.component';
import { ErrorComponent } from './error/error.component';
import { MainComponent } from './main/main.component';
import { AuthGuardAdmin } from './core/guards/auth.guard.admin';

const routes: Routes = [
  {
    path: 'auth',
    component: LayoutComponent,
    loadChildren: './auth/auth.module#AuthModule'
  },
  {
    path: '',
    component: MainComponent,
    data: {
      title: 'app.HOME'
    },
    children: [
      {
        path: 'products',
        canActivate: [AuthGuardAdmin],
        loadChildren: './components/products/products.module#ProductsModule',
        data: {
          title: 'Products'
        }
      },

      {
        path: '',
        loadChildren: './components/shop/shop.module#ShopModule',
        data: {
          title: 'Shop'
        }
      },
    ]
  },
  {
    path: 'error',
    component: ErrorComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
