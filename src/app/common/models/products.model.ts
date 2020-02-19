import { Category } from './category-model';

export interface Product {
    id: string;
    name: string;
    description: string;
    imgSource:string;
    status: number;
    categories: Category[];
  }