import { OrderItem } from './OrderItem';

export interface Order {
    id?:string;
    userId?:string;
    orderitems:OrderItem[];
  }