import { Product } from './products.model';

export interface ProductDetail {
  id?:string;
  productId:string;
    type:string;
    price:number;
    availability:number;
    status?: number;
    product?:Product;
  }