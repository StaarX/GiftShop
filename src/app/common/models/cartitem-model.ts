import { ProductDetail } from './productDetail-model';

export interface CartItem {
      cartid:string;
      productDetailId:string;
      quantity:number;
      unitPrice:number;
      productDetail:ProductDetail;
  }