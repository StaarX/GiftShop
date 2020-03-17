import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { API_URL } from 'src/app/core/api-url.token';
import { ASSETS_URL } from 'src/app/core/assets-url.token';
import { Product } from 'src/app/common/models/products.model';
import { Cart } from 'src/app/common/models/cart-model';
import { MainComponent } from 'src/app/main/main.component';

@Injectable()
export class CartService {

  private readonly _url: string;
  private readonly _cartUrl: string;

  constructor(
    private _httpClient: HttpClient,
    @Inject(API_URL) apiUrl: string,
    @Inject(ASSETS_URL) assetsUrl: string) {
    this._url = `${apiUrl}/api/products`;
    this._cartUrl = `${apiUrl}/api/cart`;
  }

  //Helper Methods
  foundSameItem(idDetail:string){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+idDetail)&&value.trim()!='') {
       return true;
      }
     }
    }
    return false;
  }

  checkAvailabilityxQtyDesired(idDetail:string,availability:number,selectedQty:number,previousQty){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+idDetail)&&value.trim()!='') {
       let parsedValue=JSON.parse(value);
       if (availability<(parsedValue.quantity+selectedQty)) {
         return false;
       }
       previousQty.number=parsedValue.quantity;
       return true;
      }
     }
    }
    return true;
  }

  //Methods
  deleteLocalStorage(key:string){
    localStorage.removeItem(key);
  }

  changeQtyLocalStorage(item:CartItem):boolean{
    if(localStorage.length>0){
          for (let index = 0; index < localStorage.length; index++) {
          let key= localStorage.key(index);
          let value= localStorage.getItem(key);
          if (key.includes("CartI:"+item.productDetail.id)&&value.trim()!='') {
          localStorage.setItem("CartI:"+item.productDetail.id,JSON.stringify(item));
          return true;
        }
      } 
  }
  return false;
  }

  addItemToLocalStorageCart(key:string,item:string){
  localStorage.setItem(key,item);
  }

  addItemToDBCart(cartItem:CartItem):Promise<boolean>{
   return this.saveCartItem(cartItem).toPromise().then(res=>{
      return true;
    }).catch(err=>{
      return false;
    });
  }

  getLocalStorageItems():CartItem[]{
    var aux:CartItem[]=[];
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:")&&value.trim()!='') {
        let parsedValue=JSON.parse(value);
        parsedValue.key=key;
        aux.push(parsedValue);

      }
     }
    }
    return aux;
  }

  getCartByUserId(userId:string):Promise<Cart>{
  return this.getCartByUser(userId).toPromise().then(res=>{
      return res;
    });
  }

  getMergedCart(cart:Cart):Promise<Cart>{
        return this.updateCart(cart,cart.userId).toPromise().then(res=>{
          localStorage.clear();
          return res;
        });
  }

//Calls to the API
  saveCartItem(model: CartItem): Observable<any> {
    return this._httpClient.post<any>(this._cartUrl+"/insertItem", model);
  }

  updateQty(model: CartItem): Observable<any> {
    return this._httpClient.put<any>(this._cartUrl+"/updateQty", model);
  }

  updateCart(model: Cart, id:string): Observable<Cart> {
    return this._httpClient.put<any>(this._cartUrl+"/"+id, model);
  }

  getCartByUser(id:string):Observable<Cart>{
    return this._httpClient.get<any>(this._cartUrl+'/'+id);
  }
  buyTheCart(model:Cart):Observable<any>{
    return this._httpClient.put<any>(this._cartUrl+'/buyTheCart',model);
  }
  get(id: string): Observable<Product> {
    return this._httpClient.get<Product>(`${this._url}/${id}`);
  }
  delete(id: string,detailid:string): Observable<any> {
    return this._httpClient.delete<any>(`${this._cartUrl}/${id}/${detailid}`);
  }
}
