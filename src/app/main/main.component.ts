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

  constructor(private _authService: AuthService,private readonly _router: Router, private _mainService:CartService,
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

  loadCart(){
    if (this._router.url.includes('/detailed')) {
      this.summaryDisabled=true;
    }else{
      this.summaryDisabled=false;
    }    
    
    this.cartItems=[];
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
    //Case user is logged 
    if (this.Logged) {
      this._mainService.getCartByUser(this.userInfo.id).subscribe(res=>{
      //If there is not a item in the local storage then the dbcart is assigned
        if(aux.length<1){
          this.cartItems=res.cartItems;
          return;
        }
        let cart:Cart={
          userId:this.userInfo.id,
          cartItems:aux
        }

        this._mainService.updateCart(cart,this.userInfo.id).toPromise().then(res=>{
          this.cartItems=res.cartItems;
          localStorage.clear();
        });

      });
    }else{
      this.cartItems=aux;
    }
    
  }

  includesCartItem(target:CartItem[],item:CartItem):number{
    for (let index = 0; index < target.length; index++) {
      if(target[index].productDetail.id==item.productDetail.id){
        return index;
      } 
    }
    return -1;
  }

  deleteItemFromCart(thing:any,position:number){
this._messageBox.confirm('Are you sure you wan to remove this item?').subscribe(res=>{
  if(res){
    if (this.Logged) {
      this._mainService.delete(this.cartItems[position].cartID,this.cartItems[position].productDetail.id).subscribe(res=>
        {
          this.loadCart();
        });
      return;
    }

    localStorage.removeItem(thing.key);
    for (let index = 0; index < this.cartItems.length; index++) {
      if (this.cartItems[index].key==thing.key) {
        this.cartItems.splice(index--,1);
      }
    }
    this.loadCart();
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

      if(localStorage.length>0){
        for (let index = 0; index < localStorage.length; index++) {
        let key= localStorage.key(index);
        let value= localStorage.getItem(key);
        
        if (key.includes("CartI:"+item.productDetail.id)&&value.trim()!='') {
         localStorage.setItem("CartI:"+item.productDetail.id,JSON.stringify(this.cartItems[position]));
         
       }
    } 
}

if (this.Logged) {
  this.disabledCheckout=true;
  this.cartItems[position].userId=this.userInfo.id;
   this._mainService.updateQty(this.cartItems[position]).subscribe(res=>this.disabledCheckout=false);
 }
}
}


