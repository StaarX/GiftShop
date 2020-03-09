import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { API_URL } from 'src/app/core/api-url.token';
import { ASSETS_URL } from 'src/app/core/assets-url.token';
import { Product } from 'src/app/common/models/products.model';
import { Cart } from 'src/app/common/models/cart-model';

@Injectable()
export class CartService {

  private readonly _url: string;
  private readonly _cartUrl: string;

  constructor(
    private _httpClient: HttpClient,
    @Inject(API_URL) apiUrl: string,
    @Inject(ASSETS_URL) assetsUrl: string) {
    this._url = `${apiUrl}/api/products`;
    this._cartUrl = `${apiUrl}/api/cart`
  }

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

  save(model: Product): Observable<any> {
    return this._httpClient.post<any>(this._url, model);
  }

  update(id: string, model: Product,): Observable<any> {
    return this._httpClient.put<any>(`${this._url}/${id}`, model);
  }

  delete(id: string,detailid:string): Observable<any> {
    return this._httpClient.delete<any>(`${this._cartUrl}/${id}/${detailid}`);
  }
}
