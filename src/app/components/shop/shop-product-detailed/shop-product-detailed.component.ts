import { Component, OnInit, OnDestroy } from '@angular/core';

import { ComponentBase } from '../../../common/component-base';
import { PaginatedResult } from '../../../common/models/paginated-result.model';
import { PaginatedRequest } from '../../../common/models/paginated-request.model';
import { ShopService } from '../services/shop.service';
import { Product } from '../../../common/models/products.model';
import { MessageBoxService } from '../../../core/services/message-box.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Category } from 'src/app/common/models/category-model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shop-product-detailed',
  templateUrl: './shop-product-detailed.component.html',
  styleUrls: ['./shop-product-detailed.component.scss'],
})
export class ShopProductDetailedComponent extends ComponentBase
  implements OnInit, OnDestroy {
  private _paginatedRequest: PaginatedRequest = {};
  page: PaginatedResult<Product>;
  public categories:PaginatedResult<Category>;
  selectedCategorytoSort;
  pageSize = 9;
  currentPage = 1;
  //Modal vars
  public productId: string;
  public productInfo:Product={id:"",
                            name:"",
                            description:"",
                            imgSource:"",
                            status:0,
                            categories:[],
                            productDetails:[]
                            };
  public selectedType:any;
  public selectedQty:number;
  public previousQty:number=0;
  

  constructor(private readonly _notificationService: NotificationService,
    private _shopService: ShopService,
    private _messageBox: MessageBoxService,
    private _errorHandler: ErrorHandlerService,
    private modalService: NgbModal,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    super();
    this.getCategories();
  }


  ngOnInit() {
    this.productId = this._route.snapshot.paramMap.get('id');
     this.get(this.productId);
  }

  goBack(){
    this._router.navigateByUrl("/shop")
  }

  //ngFor functions
  availabilityToArray(){
  if (this.selectedType!=undefined) {
    return Array(this.selectedType.availability);
  }
  }

 // Required boolean NgIf's functions
  hasProductDetails(){
    if (this.productInfo.productDetails.length<=0) {
      return true;
    }
    return false;
  }
  hasTypeValue(){
    if (this.selectedType!=undefined && this.selectedType.availability>0) {
      return true;
    }
    return false;
  }

  private get(productId: string) {
    this.registerRequest(this._shopService.get(productId)).subscribe({
      next:queryResult =>{
        this.productInfo=queryResult;
      console.log(this.productInfo);
    },
      error: errorResponse => this._errorHandler.handle(errorResponse),
    });
  }

//Modal functions
  addCart() {
      if (this.productInfo.productDetails.length>0&&this.selectedType!=undefined&&this.selectedQty!=undefined) {

        if (this.foundSameItem) {
         if (this.checkAvailabilityxQtyDesired()) {
           localStorage.setItem("CartI:"+this.productInfo.name+":"+this.selectedType.type,JSON.stringify({
                                                                      productId:this.productInfo.id,
                                                                      name:this.productInfo.name,
                                                                      description:this.productInfo.description,
                                                                      imgSource:this.productInfo.imgSource,
                                                                      qty:this.previousQty+this.selectedQty,
                                                                      productDetail:{
                                                                        id:this.selectedType.id,
                                                                        type:this.selectedType.type,
                                                                        price:this.selectedType.price,
                                                                        availability:this.selectedType.availability
                                                                      }                                                              
             })); 
             this.handleAddToCartSuccess('The item was successfully added to the cart');
             return;
           }else{
               this.handleAddToCartFailure('The quantity desired is more than the available for the selected Type.');
               return;
             } 
      
         }

      localStorage.setItem("CartI:"+this.productInfo.name+":"+this.selectedType.type,JSON.stringify({
                                                                      productId:this.productInfo.id,
                                                                      name:this.productInfo.name,
                                                                      description:this.productInfo.description,
                                                                      imgSource:this.productInfo.imgSource,
                                                                      qty:this.selectedQty,
                                                                      productDetail:{
                                                                        id:this.selectedType.id,
                                                                        type:this.selectedType.type,
                                                                        price:this.selectedType.price,
                                                                        availability:this.selectedType.availability
                                                                      }                                                              
      }));
      this.handleAddToCartSuccess('The item was successfully added to the cart');
      }
   
  }

  private getCategories(){
    this._paginatedRequest.page=1;
    this.registerRequest(this._shopService.getPageCategories(this._paginatedRequest)).subscribe(response=>{
    this.categories=response;
  });
  }

  foundSameItem(){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+this.productInfo.name+":"+this.selectedType.type)&&value.trim()!='') {
       return true;
      }
     }
    }
    return false;
  }

  checkAvailabilityxQtyDesired(){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+this.productInfo.name+":"+this.selectedType.type)&&value.trim()!='') {
       let parsedValue=JSON.parse(value);
       if (this.selectedType.availability<(parsedValue.qty+this.selectedQty)) {
         return false;
       }
       this.previousQty=parsedValue.qty;
       return true;
      }
     }
    }
    return true;
  }

  handleAddToCartSuccess(msg:string){
    this._notificationService.success(msg);
  this.goBack();
  }

  handleAddToCartFailure(msg:string){
    this._notificationService.error(msg);
    //Values back to default
      this.previousQty=0;
  }

  typeChanged(){
    console.log(this.selectedType.type);
    if (this.selectedType.availability<=0) {
      this.selectedQty=undefined;
    }
  }
  qtyChanged(){
    
  }
}