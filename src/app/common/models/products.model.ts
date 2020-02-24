import { Category } from './category-model';
import { ProductDetail } from './productDetail-model';

export interface Product {
    id: string;
    name: string;
    description: string;
    imgSource:string;
    status: number;
    categories: Category[];
    productDetails:ProductDetail[];
  }