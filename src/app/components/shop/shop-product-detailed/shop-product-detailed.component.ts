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
import { AuthModel } from 'src/app/common/models/auth.model';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-shop-product-detailed',
  templateUrl: './shop-product-detailed.component.html',
  styleUrls: ['./shop-product-detailed.component.scss'],
})
export class ShopProductDetailedComponent extends ComponentBase
  implements OnInit, OnDestroy {
  userInfo:AuthModel;
  autenticated:boolean;
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
  public previousQty={number:0};
  

  constructor(private readonly _notificationService: NotificationService,
    private _shopService: ShopService,
    private _messageBox: MessageBoxService,
    private _errorHandler: ErrorHandlerService,
    private modalService: NgbModal,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _cartService:CartService,
  ) {
    super();
  }


  ngOnInit() {
    this.productId = this._route.snapshot.paramMap.get('id');
     this.get(this.productId);
  }

  goBack(){
    this._router.navigateByUrl("/")
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
    },
      error: errorResponse => this._errorHandler.handle(errorResponse),
    });
  }

//Modal functions
  addCart() {
    const {id,name,description,imgSource}=this.productInfo;
    if (this.productInfo.productDetails.length>0&&this.selectedType!=undefined&&this.selectedQty!=undefined) {
      //DTO declaration
    let cart:CartItem={
      userid:'',
      quantity:0,
      unitPrice:this.selectedType.price,
      productDetail:{
        id:this.selectedType.id,
        productId:id,
        type:this.selectedType.type,
        price:this.selectedType.price,
        availability:this.selectedType.availability,
        product:{
          id,
          name,
          description,
          imgSource
        }
      }
};
//Save logic start
if (this.autenticated) {
  //Values that change
    cart.userid=this.userInfo.id
    cart.quantity=this.previousQty.number+this.selectedQty;
      this._cartService.addItemToDBCart(cart).then(res=>{
        if(res){
          this.handleAddToCartSuccess('The item was successfully added to the cart');
        }else{
          this.handleAddToCartFailure('There was an error while adding your item to the database');
        }
      });
  return;
}
      //Case User is not logged
       if (this._cartService.checkAvailabilityxQtyDesired(cart.productDetail.id, this.selectedType.availability,this.selectedQty,this.previousQty)) {
            //Values that change
            cart.userid='unregistered'
            //We proceed to check if there is the same item in the cart
            if (this._cartService.foundSameItem(cart.productDetail.id)){
            cart.quantity=this.previousQty.number+this.selectedQty;
            }else{
              cart.quantity=this.selectedQty;
            }
            this._cartService.addItemToLocalStorageCart("CartI:"+this.selectedType.id,JSON.stringify(cart));
            this.handleAddToCartSuccess('The item was successfully added to the cart');
            return;
         }else{
          cart.quantity=cart.productDetail.availability;
          this._cartService.addItemToLocalStorageCart("CartI:"+this.selectedType.id,JSON.stringify(cart));
          this.handleAddToCartSuccess('The item was successfully added to the cart');
             return;
           }  
          }else{
            this.handleAddToCartFailure('You cannot do that');
            return;
          } 
  }
  handleAddToCartSuccess(msg:string){
    this._notificationService.success(msg);
  this.goBack();
  }

  handleAddToCartFailure(msg:string){
    this._notificationService.error(msg);
    //Values back to default
      this.previousQty.number=0;
  }

  typeChanged(){
    if (this.selectedType.availability<=0) {
      this.selectedQty=undefined;
    }
  }
  qtyChanged(){
    
  }
}