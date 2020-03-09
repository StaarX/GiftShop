import { ProductDetail } from './productDetail-model';

export interface CartItem {
      cartID?:string;
      userid:string;
      quantity:number;
      unitPrice:number;
      productDetail:ProductDetail;
  }