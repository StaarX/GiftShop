import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  public cartItems=[];
  selectedQty=[];


  constructor(private _authService: AuthService,private readonly _router: Router) { 
    
  }

  ngOnInit(){
    this.loadCart();
  }


  //Cart functions
  goBack(){
    this._router.navigateByUrl("/shop")
  }
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

    availabilityToArray(qty:number){
    if (qty>0) {
      return Array(qty);
    }
    }
    
    qtyChanged(item:any,position:number){
      if(localStorage.length>0){
        for (let index = 0; index < localStorage.length; index++) {
        let key= localStorage.key(index);
        let value= localStorage.getItem(key);
        
        if (key.includes("CartI:"+item.name+":"+item.productDetail.type)&&value.trim()!='') {
         localStorage.setItem("CartI:"+item.name+":"+item.productDetail.type,JSON.stringify({
                                                                      productId:item.id,
                                                                      name:item.name,
                                                                      description:item.description,
                                                                      imgSource:item.imgSource,
                                                                      qty:this.selectedQty[position],
                                                                      productDetail:{
                                                                        id:item.productDetail.id,
                                                                        type:item.productDetail.type,
                                                                        price:item.productDetail.price,
                                                                        availability:item.productDetail.availability
         }}));

        
       }
    } 

}
}
}


