import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { AuthModel } from 'src/app/common/models/auth.model';
import { CartService } from 'src/app/core/services/cart.service';
import { Cart } from 'src/app/common/models/cart-model';
import { NotificationService } from 'src/app/core/services/notification.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit{
  public cartItems=[];
  selectedQty=[];
  Logged=false;
  userInfo:AuthModel;
  disabledCheckout=false;


  constructor(private _authService: AuthService,private readonly _router: Router, private _mainService:CartService
    ,private readonly _notificationService: NotificationService) { 
    this.ngOnInit();
  }

  ngOnInit(){
    this._authService.isAuthenticated().toPromise().then(res=>{
      this.Logged=res;
      if (res) {
        this._authService.getAuthInfo().toPromise().then(res=>{
          this.userInfo=res;
        });
      }
    this.loadCart();
    });
  }


  //Cart functions
  goBack(){
    this._router.navigateByUrl("/")
  }
  loadCart(){    
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

  deleteItemFromCart(thing:any){
    localStorage.removeItem(thing.key);

    for (let index = 0; index < this.cartItems.length; index++) {
    
      if (this.cartItems[index].key==thing.key) {
        this.cartItems.splice(index--,1);
      }

    }
    this.loadCart();
  }

checkout(){
  if (this.Logged) {
    this._router.navigate(['summary']);
  }else{
     this._router.navigate(['summary']);
     this._notificationService.info('You must be logged in order to buy an item');
    }
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


