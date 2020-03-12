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
  public previousQty={number:0};
  

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
private getToPromise(productId: string) {
  return this.registerRequest(this._shopService.get(productId)).toPromise();
  }

  openModal(content,id:string) {
      this.getToPromise(id).then(queryResult=>{
        this.modalInfo=queryResult;
        const {id,name,description,imgSource}=this.modalInfo;

        this.modalService.open(content, {windowClass:'modal-container',ariaLabelledBy: 'modal-basic-title',centered:true}).result.then((result) => {
          if (this.modalInfo.productDetails.length>0&&this.selectedType!=undefined&&this.selectedQty!=undefined) {
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
        }, (reason) => {
          //When dismissed set everything back to default
          this.modalBackToDefault();
        });
      }).catch(err=>this.handleAddToCartFailure(err));
    
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
      this.previousQty.number=0;
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