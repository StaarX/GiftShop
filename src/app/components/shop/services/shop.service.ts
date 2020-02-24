import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { API_URL } from '../../../core/api-url.token';
import { ASSETS_URL } from '../../../core/assets-url.token';
import { PaginatedRequest } from '../../../common/models/paginated-request.model';
import { PaginatedResult } from '../../../common/models/paginated-result.model';
import { Product } from '../../../common/models/products.model';
import { Category } from '../../../common/models/category-model';

@Injectable()
export class ShopService {

  private readonly _url: string;

  constructor(
    private _httpClient: HttpClient,
    @Inject(API_URL) apiUrl: string,
    @Inject(ASSETS_URL) assetsUrl: string) {
    this._url = `${apiUrl}/api/products`;
  }

  getPage(query: PaginatedRequest): Observable<PaginatedResult<Product>> {
    const params: any = query;
    return this._httpClient.get<PaginatedResult<Product>>(this._url, { params });
  }
  getPageCategories(query: PaginatedRequest): Observable<PaginatedResult<Category>> {
    const params: any = query;
    return this._httpClient.get<PaginatedResult<Category>>(this._url+'/categories', { params });
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

  delete(id: string): Observable<any> {
    return this._httpClient.delete<any>(`${this._url}/${id}`);
  }
}
