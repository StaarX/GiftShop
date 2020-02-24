import { Component } from '@angular/core';

import { NavItem } from '../common/models/nav-item.model';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  dropdownState=false;
  public cartItems=[];

  navItems: NavItem[] = [
    {name:'Products',route:['/products']},
    {name:'Shop',route:['/shop']}
  ];

  constructor(private _authService: AuthService) { }

  logOut() {
    this._authService.logOut();
  }

  //Cart functions
  loadCart(){    
    this.cartItems=[];
    if(localStorage.length>0){
      for (let index = 0; index < localStorage.length; index++) {
      let key= localStorage.key(index);
      let value= localStorage.getItem(key);
      
      if (key.includes("CartI:")&&value.trim()!='') {
        let parsedValue=JSON.parse(value);
        parsedValue.key=key;
        this.cartItems.push(parsedValue);
        console.log(parsedValue);
      }
     }
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

  calculateTotal(){
    var total=0;

    this.cartItems.forEach(item =>{
      let itemtotal=0;

      itemtotal=item.qty*item.productDetail.price;

      total=total+itemtotal;
    });

    return total;
  }
  
}
