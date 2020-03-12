import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { AuthModel } from 'src/app/common/models/auth.model';
import { CartService } from 'src/app/core/services/cart.service';
import { Cart } from 'src/app/common/models/cart-model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MessageBoxService } from 'src/app/core/services/message-box.service';


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


  constructor(private _authService: AuthService,private readonly _router: Router, private _cartService:CartService
    ,private readonly _notificationService: NotificationService,private _messageBox: MessageBoxService) { 
    this.ngOnInit();
  }

  ngOnInit(){
    this._authService.isAuthenticated().toPromise().then(res=>{
      this.Logged=res;
      if (res) {
        this._authService.getAuthInfo().toPromise().then(res=>{
          this.userInfo=res;
    this.loadCart();
    return;
        });
      }else{
    this.loadCart();
      }
    });
  }


  //Cart functions
  goBack(){
    this._router.navigateByUrl("/")
  }

  loadCart(){    
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
              this.loadCart();
            });
        }else{
          //Not logged case
          this._cartService.deleteLocalStorage(thing.key);
          this.loadCart();
        }
      }
    });
       
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
  if (this.Logged) {
    this.disabledCheckout=true;
    this.cartItems[position].userId=this.userInfo.id;
    this._cartService.updateQty(this.cartItems[position]).subscribe(res=>this.disabledCheckout=false);
  }else{
    this._cartService.changeQtyLocalStorage(this.cartItems[position]);
  }
  }
}


