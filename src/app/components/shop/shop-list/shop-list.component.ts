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
import { Cart } from 'src/app/common/models/cart-model';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthModel } from 'src/app/common/models/auth.model';
import { stringify } from 'querystring';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-example-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.scss'],
})
export class ShopListComponent extends ComponentBase
  implements OnInit, OnDestroy {
  private _paginatedRequest: PaginatedRequest = {};
  page: PaginatedResult<Product>;
  public categories:PaginatedResult<Category>;
  selectedCategorytoSort;
  pageSize = 9;
  currentTerm = '';
  userInfo:AuthModel;
  autenticated:boolean;
  //Modal vars
  public modalInfo:Product;
  public cart:Cart;
  public selectedType:any;
  public selectedQty:number;
  public previousQty:number=0;
  

  constructor(private readonly _notificationService: NotificationService,
    private _shopService: ShopService,
    private _messageBox: MessageBoxService,
    private _errorHandler: ErrorHandlerService,
    private modalService: NgbModal,
    private _authService:AuthService,
    private _cartService:CartService
  ) {
    super();
    this.getCategories();
  }


  ngOnInit() {
    this.getPage(1);
    this._authService.isAuthenticated().subscribe(res=>{
      this.autenticated=res;
      if (res) {
        this._authService.getAuthInfo().subscribe(res=>{
          this.userInfo=res;
        });
      }

    });
  }

  getPage(page: number) {
    this._paginatedRequest.page = page;
    this._paginatedRequest.pageSize=this.pageSize;

    if (this.selectedCategorytoSort!=undefined && this.currentTerm=='') {
      this.filterbyCategory();
      return;
    } else if(this.currentTerm!='' && this.selectedCategorytoSort==undefined){
      this.filterbyTerm();
      return;
    } else if(this.currentTerm!='' && this.selectedCategorytoSort!=undefined){
      this.filterbyTermAndCategory();
      return;
    }
    this.getThePage();
  }

  delete(product: Product) {
    this._messageBox
      .confirm(
        { key: 'products.CONFIRM_DELETE', arg: { name: product.name } },
        'products.DELETE'
      )
      .subscribe((result: boolean) => {
        if (result) {
          this._shopService.delete(product.id).subscribe(
            () => {
              this.getPage(1);
            },
            error => this._errorHandler.handle(error)
          );
        }
      });
  }
  //ngFor functions
  availabilityToArray(){
  if (this.selectedType!=undefined) {
    return Array(this.selectedType.availability);
  }
  }

 // Required boolean NgIf's functions
  hasProductDetails(){
    if(this.modalInfo!=undefined){
      if (this.modalInfo.productDetails.length<=0) {
        return true;
      }
      return false;
    }
  }
  hasTypeValue(){
    if (this.selectedType!=undefined && this.selectedType.availability>0) {
      return true;
    }
    return false;
  }

//Modal functions
private get(productId: string) {
this.registerRequest(this._shopService.get(productId)).toPromise().then(queryResult=>{
  this.modalInfo=queryResult;
}).catch(errorResponse => this._errorHandler.handle(errorResponse));
}

  addToCart(cartitem:CartItem){
    this._cartService.saveCartItem(cartitem).toPromise().then(res=>{
      localStorage.clear();
    });
  }

  openModal(content,id:string) {
      this.get(id);
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',centered:true}).result.then((result) => {
      if (this.modalInfo.productDetails.length>0&&this.selectedType!=undefined&&this.selectedQty!=undefined) {
        //DTO declaration
      let cart:CartItem={
        userid:'',
        quantity:0,
        unitPrice:this.selectedType.price,
        productDetail:{
          id:this.selectedType.id,
          productId:this.modalInfo.id,
          type:this.selectedType.type,
          price:this.selectedType.price,
          availability:this.selectedType.availability,
          product:{
            id:this.modalInfo.id,
            name:this.modalInfo.name,
            description:this.modalInfo.description,
            imgSource:this.modalInfo.imgSource
          }
        }
  };
        if (this.foundSameItem) {
         if (this.checkAvailabilityxQtyDesired()) {
            if (this.autenticated) {
              //Values that change
                cart.userid=this.userInfo.id
                cart.quantity=this.previousQty+this.selectedQty;
             localStorage.setItem("CartI:"+this.selectedType.id,JSON.stringify(cart));
             this.addToCart(cart);
             this.handleAddToCartSuccess('The item was successfully added to the cart');
             return;
            }else{
              //Values that change
              cart.userid='unregistered'
              cart.quantity=this.previousQty+this.selectedQty;
         localStorage.setItem("CartI:"+this.selectedType.id,JSON.stringify(cart)); 
         this.handleAddToCartSuccess('The item was successfully added to the cart');
         return;
            }
           }else{
               this.handleAddToCartFailure('The quantity desired is more than the available for the selected Type.');
               return;
             } 
      
         }
         //If same item was not found
             if (this.autenticated) {
               //Values that cahnge
              cart.userid=this.userInfo.id
              cart.quantity=this.selectedQty; 
              localStorage.setItem("CartI:"+this.selectedType.id,JSON.stringify(cart)); 
              this.handleAddToCartSuccess('The item was successfully added to the cart');
              return;
             }else{
               //Values that change
               cart.userid='unregistered'
               cart.quantity=this.previousQty+this.selectedQty;
          localStorage.setItem("CartI:"+this.selectedType.id,JSON.stringify(cart)); 
          this.handleAddToCartSuccess('The item was successfully added to the cart');
          return;
             }
            }else{
                this.handleAddToCartFailure('The quantity desired is more than the available for the selected Type.');
                return;
              } 
    }, (reason) => {
      //When dismissed set everything back to default
      this.modalBackToDefault();
    });
  }

  private getCategories(){
    this._paginatedRequest.page=1;
    this.registerRequest(this._shopService.getPageCategories(this._paginatedRequest)).subscribe(response=>{
    this.categories=response;
  });
  }

  modalBackToDefault(){
    this.modalInfo={id:"",
                            name:"",
                            description:"",
                            imgSource:"",
                            status:0,
                            categories:[],
                            productDetails:[]
                            };
      this.selectedType=undefined;
      this.selectedQty=undefined;
      this.previousQty=0;
  }

  foundSameItem(){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+this.selectedType.id)&&value.trim()!='') {
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
      
      if (key.includes("CartI:"+this.selectedType.id)&&value.trim()!='') {
       let parsedValue=JSON.parse(value);
       if (this.selectedType.availability<(parsedValue.quantity+this.selectedQty)) {
         return false;
       }
       this.previousQty=parsedValue.quantity;
       return true;
      }
     }
    }
    return true;
  }

  disabledSaveButton(){
    if (this.selectedType!=undefined && this.selectedQty!=undefined){
      return false;
    }
    return true;
  }

  handleAddToCartSuccess(msg:string){
    this._notificationService.success(msg);
//Values back to default
this.modalBackToDefault();
  }

  handleAddToCartFailure(msg:string){
    this._notificationService.error(msg);
    //Values back to default
    this.modalBackToDefault();
  }
  
  buyOneItem(item:any){
      if(this.autenticated){
        this._messageBox.confirm('Do you want to buy one '+item.name+'?').subscribe(res=>{
          if(res){
            //Handle all the buying thing here
            this._notificationService.success('You have bought one '+item.name);
          }else{
            return;
          }
        });
      }else{
        this._notificationService.info('You must be logged in order to buy an item');
      }
   
  }
  typeChanged(){
    console.log(this.selectedType.type);
    if (this.selectedType.availability<=0) {
      this.selectedQty=undefined;
    }
  }

  updatePage(){
    this.filterIt();
  }

  filterIt(){
    this._paginatedRequest.pageSize=this.pageSize;
    if (this.selectedCategorytoSort!=undefined && this.currentTerm=='') {
      this.filterbyCategory();
      return;
    } else if(this.currentTerm!='' && this.selectedCategorytoSort==undefined){
      this.filterbyTerm();
      return;
    } else if(this.currentTerm!='' && this.selectedCategorytoSort!=undefined){
      this.filterbyTermAndCategory();
      return;
    }
    this.getThePage();
  }


  getThePage(){
    this.registerRequest(
      this._shopService.getPage(this._paginatedRequest)
    ).subscribe((response) => {
      this.page = response;
    });
  }

  filterbyTerm(){
          this._paginatedRequest.term = this.currentTerm;
          this._paginatedRequest.pageSize=this.pageSize;
          this.registerRequest(
            this._shopService.getPage(this._paginatedRequest)
          ).subscribe((response) => {
            this.page = response;
            this._paginatedRequest.term='';
          });
  }

  filterbyTermAndCategory(){
    this._paginatedRequest.term = this.currentTerm;
    this._paginatedRequest.pageSize=this.pageSize;
    this.registerRequest(
      this._shopService.getPageFilteredByCategory(this._paginatedRequest,this.selectedCategorytoSort.id)
    ).subscribe((response) => {
      this.page = response;
      this._paginatedRequest.term='';
    });
  }

  
  filterbyCategory(){
          this._paginatedRequest.pageSize=this.pageSize;
          this.registerRequest(
            this._shopService.getPageFilteredByCategory(this._paginatedRequest,this.selectedCategorytoSort.id)
          ).subscribe((response) => {
            this.page = response;
          });
  }
}