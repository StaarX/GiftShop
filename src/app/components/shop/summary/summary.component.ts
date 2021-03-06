import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/models/cartitem-model';
import { AuthModel } from 'src/app/common/models/auth.model';
import { CartService } from 'src/app/core/services/cart.service';
import { Cart } from 'src/app/common/models/cart-model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Regex } from 'src/app/shared/Regex';
import { MessageBoxService } from 'src/app/core/services/message-box.service';
import { NotificationService } from 'src/app/core/services/notification.service';


@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit{
  public form: FormGroup;
  cartItems=[];
  selectedQty=[];
  Logged=false;
  userInfo:AuthModel;
  disabledCheckout=false;


  constructor(private _authService: AuthService,private readonly _router: Router, private _cartService:CartService,
    private readonly _route: ActivatedRoute,
    public fb: FormBuilder,
    private _messageBox: MessageBoxService,private readonly _notificationService: NotificationService) { 
      this.form = fb.group({
        onecc: [ '', [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.pattern(Regex.Numbers)]],
        twocc: [ '', [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.pattern(Regex.Numbers)]],
        threecc: [ '', [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.pattern(Regex.Numbers)]],
        fourcc: [ '', [Validators.required, Validators.maxLength(4), Validators.minLength(4), Validators.pattern(Regex.Numbers)]],
        expirationdate: [ '', [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.pattern(Regex.ExpirationDate)]],
        cvc: [ '', [Validators.required, Validators.maxLength(3),  Validators.minLength(3), Validators.pattern(Regex.Numbers)]],
      });
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

  //Summary functions
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

  calculateTotal(){
    var total=0;

    this.cartItems.forEach(item =>{
      let itemtotal=0;

      itemtotal=item.quantity*item.productDetail.price;

      total=total+itemtotal;
    });

    return total;
  }

  buyTheCart(){
      if (this.Logged) {
        if (this.form.invalid) {
          this._notificationService.error('Please follow the placeholder!');
          return;
        }
      this._messageBox.confirm('Do you want to buy the cart for a total of '+this.calculateTotal().toFixed(2)).subscribe(res=>{
        if(res){
          //Handle all the buying thing here
          let cart:Cart={
            userId:this.userInfo.id,
            cartItems:this.cartItems
          }

          this._cartService.buyTheCart(cart).toPromise().then(res=>{
            console.log('Res from database');
            console.log(res);
            if (res.itemsThatApplied.length > 0) {
            this._notificationService.success('You have bought your cart for a total of '+this.calculateTotal().toFixed(2));
            this._router.navigate(['/']);
            }else{
              this._notificationService.error('An error occurred while processing your order');
            }
          }).catch(error=>{
            this._notificationService.error('An error occurred while processing your order');
            console.log(error);
          });
        }else{
          return;
        }
      });
    }else{
      this._notificationService.info('You must be logged in order to buy an item');
    }
  }
}


