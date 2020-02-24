import { Component, OnInit, OnDestroy } from '@angular/core';

import { ComponentBase } from '../../../common/component-base';
import { PaginatedResult } from '../../../common/models/paginated-result.model';
import { PaginatedRequest } from '../../../common/models/paginated-request.model';
import { ShopService } from '../services/shop.service';
import { Product } from '../../../common/models/products.model';
import { MessageBoxService } from '../../../core/services/message-box.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-example-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.scss'],
})
export class ShopListComponent extends ComponentBase
  implements OnInit, OnDestroy {
  private _paginatedRequest: PaginatedRequest = {};
  page: PaginatedResult<Product>;
  public modalInfo:Product={id:"",
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
  ) {
    super();
  }


  ngOnInit() {
    this.getPage(1);
  }

  getPage(page: number) {
    this._paginatedRequest.page = page;
    this.registerRequest(
      this._shopService.getPage(this._paginatedRequest)
    ).subscribe((response) => {
      this.page = response;
      this.page.pageSize=9;
    });
  }

  sort(value: string) {
    this._paginatedRequest.orderBy = value;
    this.getPage(this._paginatedRequest.page);
  }

  delete(product: Product) {
    this._messageBox
      .confirm(
        { key: 'examples.CONFIRM_DELETE', arg: { name: product.name } },
        'examples.DELETE'
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
    if (this.modalInfo.productDetails.length<=0) {
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
  hasntTypeValue(){
    if (this.selectedType==undefined||this.selectedType.availability<=0) {
      return true;
    }
    return false;
  }

//Modal functions
  openModal(content,id:string) {
    this.page.items.forEach(element => {
      if(element.id==id){
        this.modalInfo={id:element.id,
        name:element.name,
        description:element.description,
        imgSource:element.imgSource,
        status:element.status,
        categories:[],
        productDetails:element.productDetails
        };
        console.log("found it!");
      }
    });
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',centered:true}).result.then((result) => {
      if (this.modalInfo.productDetails.length>0&&this.selectedType!=undefined&&this.selectedQty!=undefined) {

        if (this.foundSameItem) {
         if (this.checkAvailabilityxQtyDesired()) {
           localStorage.setItem("CartI:"+this.modalInfo.name+":"+this.selectedType.type,JSON.stringify({
                                                                      productId:this.modalInfo.id,
                                                                      name:this.modalInfo.name,
                                                                      description:this.modalInfo.description,
                                                                      imgSource:this.modalInfo.imgSource,
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

      localStorage.setItem("CartI:"+this.modalInfo.name+":"+this.selectedType.type,JSON.stringify({
                                                                      productId:this.modalInfo.id,
                                                                      name:this.modalInfo.name,
                                                                      description:this.modalInfo.description,
                                                                      imgSource:this.modalInfo.imgSource,
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
    }, (reason) => {
      //When dismissed set everything back to default
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
    });
  }

  foundSameItem(){
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:"+this.modalInfo.name+":"+this.selectedType.type)&&value.trim()!='') {
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
      
      if (key.includes("CartI:"+this.modalInfo.name+":"+this.selectedType.type)&&value.trim()!='') {
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
//Values back to default
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

  handleAddToCartFailure(msg:string){
    this._notificationService.error(msg);
    //Values back to default
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

  typeChanged(){
    console.log(this.selectedType.type);
    if (this.selectedType.availability<=0) {
      this.selectedQty=undefined;
    }
  }
  qtyChanged(){
    console.log("Quantity changed to: "+this.selectedQty);
  }
}