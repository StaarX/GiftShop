import { Component, OnInit, OnDestroy } from '@angular/core';

import { ComponentBase } from '../../../common/component-base';
import { PaginatedResult } from '../../../common/models/paginated-result.model';
import { PaginatedRequest } from '../../../common/models/paginated-request.model';
import { ProductsService } from '../services/products.service';
import { Product } from '../../../common/models/products.model';
import { MessageBoxService } from '../../../core/services/message-box.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-example-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent extends ComponentBase
  implements OnInit, OnDestroy {
  private _paginatedRequest: PaginatedRequest = {};
  page: PaginatedResult<Product>;

  constructor(
    private _productsService: ProductsService,
    private _messageBox: MessageBoxService,
    private _errorHandler: ErrorHandlerService,
  ) {
    super();
  }


  ngOnInit() {
    this.getPage(1);
  }

  getPage(page: number) {
    this._paginatedRequest.page = page;
    this.registerRequest(
      this._productsService.getPage(this._paginatedRequest)
    ).subscribe((response) => {
      this.page = response;
    });
  }

  sort(value: string) {
    this._paginatedRequest.orderBy = value;
    this.getPage(this._paginatedRequest.page);
  }

  delete(product: Product) {
    this._messageBox
      .confirm(
        { key: 'products.CONFIRM_DELETE', arg: { name: product.name } },
        'products.DELETE'
      )
      .subscribe((result: boolean) => {
        if (result) {
          this._productsService.delete(product.id).subscribe(
            () => {
              this.getPage(1);
            },
            error => this._errorHandler.handle(error)
          );
        }
      });
  }
}