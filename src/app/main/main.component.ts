import { Component, OnInit} from '@angular/core';

import { NavItem } from '../common/models/nav-item.model';
import { AuthService } from '../core/services/auth.service';
import { Router} from '@angular/router';
import { AuthModel } from '../common/models/auth.model';
import { CartService } from '../core/services/cart.service';
import { Cart } from '../common/models/cart-model';
import { CartItem } from '../common/models/cartitem-model';
import { isNgTemplate } from '@angular/compiler';
import { MessageBoxService } from '../core/services/message-box.service';
import { NotificationService } from '../core/services/notification.service';
import { getMatIconFailedToSanitizeUrlError } from '@angular/material';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{
  dropdownState=false;
  public cartItems=[];
  selectedQty=[];
  summaryDisabled=false;
  Logged=false;
  userInfo:AuthModel={
    id:'',
    name:'unregistered',
    email:'',
    roles:[],
    expiresIn:0
  };
  role;
  disabledCheckout=false;

  cartHiddenOn : string[]=['summary',
                            'products',
                            'cart'];
  navItems: NavItem[] = [
  ];
  publicItems:NavItem[]=[
    {name:'Shop',route:['/']},
    {name:'Cart',route:['/cart']}
  ];
  adminItems:NavItem[]=[{name:'Products List',route:['/products']},
                        {name:'New Product',route:['/products/new']}];

  constructor(private _authService: AuthService,private readonly _router: Router, private _cartService:CartService,
    private _messageBox: MessageBoxService,private readonly _notificationService: NotificationService) { 
 
  }

  ngOnInit(){
    this._authService.isAuthenticated().toPromise().then(res=>{
      this.Logged=res;
      if (res) {
        this._authService.getAuthInfo().toPromise().then(res=>{
          this.userInfo=res;
          this.role=res.roles[0];
        });
      }

    });
  }

  evaluateCartHiddenStatus(){
    for (let index = 0; index < this.cartHiddenOn.length; index++) {
      if (this._router.url.includes(this.cartHiddenOn[index])){
        return false;
      }
    }
    return true;
  }

  logOut() {
    this._authService.logOut();
    localStorage.clear();
  }
  
  //Cart functions
  checkout(){
    if (this.Logged) {
    this._router.navigate(['summary']);
  }else{
     this._router.navigate(['summary']);
     this._notificationService.info('You must be logged in order to buy an item');
    }
  }

  loadCart(wasOpened:boolean){
    if (!wasOpened) {
      return;
    }

    if (this._router.url.includes('/detailed')) {
      this.summaryDisabled=true;
    }else{
      this.summaryDisabled=false;
    }

    var localStorageCartItems=this._cartService.getLocalStorageItems();

    if (this.Logged) {
      //Case there are not items in the localstorage and i'm logged
      if (localStorageCartItems.length<1) {
        this._cartService.getCartByUserId(this.userInfo.id).then(res=>{
          return this.cartItems=res.cartItems;
        });
        return;
      }else{  
      //Case items in local storage and db items need to merge
    let cart:Cart={
      userId:this.userInfo.id,
      cartItems:localStorageCartItems
    }
        this._cartService.getMergedCart(cart).then(res=>{
          this.cartItems=res.cartItems;
          return;
        });
        return;
      }
    }else{
      //Case the user isn't logged so only show the items in localstorage
      this.cartItems=localStorageCartItems;
    }

  }

  deleteItemFromCart(thing:any,position:number){
      this._messageBox.confirm('Are you sure you want to remove this item?').subscribe(res=>{
        if(res){
          if (this.Logged) {
            this._cartService.delete(this.cartItems[position].cartID,this.cartItems[position].productDetail.id).subscribe(res=>
              {
                this.loadCart(true);
              });
          }else{
            //Not logged case
            this._cartService.deleteLocalStorage(thing.key);
          }
        }
      });
    
  }

  calculateTotal(){
    var total=0;

    this.cartItems.forEach(item =>{
      let itemtotal=0;

      itemtotal=item.quantity*item.productDetail.price;

      total=total+itemtotal;
    });

    return total;
  }

  availabilityToArray(qty:number){
    if (qty>0) {
      return Array(qty);
    }
    }
    
  qtyChanged(item:any,position:number){
    this.cartItems[position].quantity=this.selectedQty[position];
  if (this.Logged) {
    this.disabledCheckout=true;
    this.cartItems[position].userId=this.userInfo.id;
    this._cartService.updateQty(this.cartItems[position]).subscribe(res=>this.disabledCheckout=false);
  }else{
    this._cartService.changeQtyLocalStorage(this.cartItems[position]);
  }
}
}


