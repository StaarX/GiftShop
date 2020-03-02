import { Component, OnInit } from '@angular/core';
import { ComponentBase } from 'src/app/common/component-base';
import { Validators, FormGroup, FormBuilder, FormControl} from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { AppValidators } from 'src/app/common/app-validators';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PaginatedRequest } from '../../../common/models/paginated-request.model';
import { Category } from 'src/app/common/models/category-model';
import { PaginatedResult } from 'src/app/common/models/paginated-result.model';
import { Product } from 'src/app/common/models/products.model';
import { Regex } from 'src/app/shared/Regex';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductDetail } from 'src/app/common/models/productDetail-model';
import { Identifiers } from '@angular/compiler';


@Component({
  selector: 'app-products-edit',
  templateUrl: './products-edit.component.html',
  styleUrls: ['./products-edit.component.scss'],
})
export class ProductsEditComponent extends ComponentBase implements OnInit {
  public form: FormGroup;
  public formDetails: FormGroup;
  public productId: string;
  public submitted = false;
  public tried=false;
  private _paginatedRequest: PaginatedRequest = {};
  public categories:PaginatedResult<Category>;
  filter = new FormControl('');
  selectedCategory:any;
  selectedDetail:any;
  imageUrl: string = "";

  public product:Product= {id:"",
                          name:"",
                          description:"",
                          imgSource:"",
                          status:0,
                          categories:[],
                          productDetails:[]};


  public get haveChanges(): boolean {
    return this.form.dirty;
  }

  

  constructor(
    private readonly _productsService: ProductsService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _errorHandler: ErrorHandlerService,
    private readonly _notificationService: NotificationService,
    public fb: FormBuilder,
    private modalService: NgbModal
  ) {
    super();
    this.getCategories();
    console.log("Categories called");

    this.formDetails = fb.group({
      type:['',[Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Letters)]],
      availability:['',[Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Numbers)]],
      price:['',[Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Numbers)]],
      priceCents:['',[Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Numbers)]]
    });

    this.form = fb.group({
      description: [ '', [Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Desc)]],
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(Regex.Name)],],
      imgSource: ['', [Validators.required,Validators.maxLength(1500000)],]
    });
  }

  ngOnInit() {
    this.productId = this._route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.setEditMode();
     this.get(this.productId);
    } else {
      this.setAddMode();
    }
    
  }

  doSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      this._notificationService.error('Please check your fields they cannot contain numbers or special characters');
      return;
    }

    const model = this.form.getRawValue();

    if (this.productId) {
      this.insertCategoriesIntoModel(model);
      this.insertProductDetailsIntoModel(model);
      this.registerRequest(
        this._productsService.update(this.productId, model)
      ).subscribe(
        () => {
          this.form.markAsPristine();
          this.handleSuccess();
        },
        errorResponse => {
          this._errorHandler.handle(errorResponse);
        }
      );
    } else {
      this.insertCategoriesIntoModel(model);
      this.insertProductDetailsIntoModel(model);
      this.registerRequest(this._productsService.save(model)).subscribe(
        () => {
          this.form.markAsPristine();
          this.handleSuccess();
        },
        errorResponse => {
          this._errorHandler.handle(errorResponse);
        }
      );
    }
  }

  private insertProductDetailsIntoModel(model:any){
    if(this.product.productDetails.length>0){
      var aux = []
    for (let index = 0; index < this.product.productDetails.length; index++) {
      
      aux.push(this.product.productDetails[index]);
    }
    model.ProductDetails=aux;
    }
  }

  private insertCategoriesIntoModel(model:any){
    if(this.product.categories.length>0){
      var aux = []
    for (let index = 0; index < this.product.categories.length; index++) {
      
      aux.push({Id:this.product.categories[index].id});
    }
    model.Categories=aux;
    }
  }

  private get(productId: string) {
    this.registerRequest(this._productsService.get(productId)).subscribe({
      next:queryResult =>{
        this.product=queryResult;
        this.imageUrl=queryResult.imgSource;
        this.form.patchValue(queryResult);},
      error: errorResponse => this._errorHandler.handle(errorResponse),
    });
  }

  private async getCategories(){
    this._paginatedRequest.page=1;
    this.registerRequest(this._productsService.getPageCategories(this._paginatedRequest)).subscribe(response=>{
    this.categories=response;
  });
  }

  private back() {
    this._router.navigate(['/products'], { relativeTo: this._route });
  }

  private handleSuccess(): void {
    this._notificationService.success({ key: 'app.SAVE_SUCCESS' });
    this.back();
  }

  public addList(){
    var same=false;
    
    if (this.selectedCategory!=undefined) {

      for (let index = 0; index < this.product.categories.length; index++) {
        if (this.product.categories[index].id==this.selectedCategory.id) {
          same=true;
        }
        
      }

      if (!same) {
      let aux:Category={
        id:this.selectedCategory.id,
        description:this.selectedCategory.description,
        name:this.selectedCategory.name,
        status:0
      }
      this.product.categories.push(aux);
      }else{
        alert("You already have this category!");
        return;
      }
    }else{
      alert("You haven't selected any category!");
    }
  }
  public deleteCategory(id:string){
    for (let index = 0; index < this.product.categories.length; index++) {
      if (this.product.categories[index].id==id) {
        this.product.categories.splice(index--,1);
      }
    }
  }
  public convertImage(imageInput: any) {
    if (imageInput.target.files && imageInput.target.files[0]) {
      var file: File = imageInput.target.files[0];
        
      if(file.type && file.type!='image/jpeg'){
        this._notificationService.error('This format of image is not supported.');
        return;
      }
      var reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (imageInput) => {
        this.imageUrl = (<FileReader>imageInput.target).result.toString();
        this.form.get('imgSource').setValue(this.imageUrl);
      }
    }
  }

  //Product details modal
  openModal(content,id:string) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',centered:true}).result.then((result) => {
      
    }, (reason) => {
      //When dismissed set everything back to default
      
    });
  }

  defaultForm(){
    this.formDetails.reset();
    this.tried=false;
  }

  loadDetail(){
    if (this.selectedDetail==undefined) {
      this._notificationService.error('There is not a detail selected');
        return;
    }

    this.formDetails.get("type").setValue(this.product.productDetails[this.selectedDetail].type);
    this.formDetails.get("availability").setValue(this.product.productDetails[this.selectedDetail].availability);
    this.formDetails.get("price").setValue(this.product.productDetails[this.selectedDetail].price.toString().split(".")[0]);
    this.formDetails.get("priceCents").setValue(this.product.productDetails[this.selectedDetail].price.toString().split(".")[1]);
  }

  insertDetail(){
    this.tried=true;
  if (this.formDetails.invalid) {
    this._notificationService.error('Please check your fields');
      return;
  }
  try {
    
  let aux:ProductDetail={
    productId:this.product.id,
    type:this.formDetails.get("type").value,
    availability:this.formDetails.get("availability").value,
    price:Number.parseFloat(this.formDetails.get("price").value+"."+this.formDetails.get("priceCents").value)
};
this.product.productDetails.push(aux);
this._notificationService.success('The detail was successfully created');
  } catch (error) {
    this._notificationService.success('There was a error while creating the detail');
  }
  }
  updateDetail(id:number){
    this.tried=true;
  if (this.formDetails.invalid) {
      this._notificationService.error('Please check your fields');
        return;
    }
  if (this.selectedDetail==undefined || this.selectedDetail<0) {
    this._notificationService.error('There is no detail selected');
        return;
  }
  try {
    this.product.productDetails[this.selectedDetail].type=this.formDetails.get("type").value;
    this.product.productDetails[this.selectedDetail].availability=this.formDetails.get("availability").value;
    this.product.productDetails[this.selectedDetail].price=Number.parseFloat(this.formDetails.get("price").value+"."+this.formDetails.get("priceCents").value);
    this._notificationService.success('The detail was successfully updated');
  } catch (error) {
    this._notificationService.success('There was a error while updating the detail');
  }
    
  }
  deleteDetail(){
  if (this.selectedDetail==undefined || this.selectedDetail<0) {
      this._notificationService.error('There is not a detail selected');
      return;
  }

  this.product.productDetails.splice(this.selectedDetail--,1);
  this.selectedDetail=undefined;
  }
}
