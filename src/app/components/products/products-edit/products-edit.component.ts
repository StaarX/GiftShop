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


@Component({
  selector: 'app-products-edit',
  templateUrl: './products-edit.component.html',
  styleUrls: ['./products-edit.component.scss'],
})
export class ProductsEditComponent extends ComponentBase implements OnInit {
  public form: FormGroup;
  public productId: string;
  public submitted = false;
  private _paginatedRequest: PaginatedRequest = {};
  public categories:PaginatedResult<Category>;
  filter = new FormControl('');
  selectedCategory:any;
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
    public fb: FormBuilder
  ) {
    super();
    this.getCategories();
    console.log("Categories called");
    this.form = fb.group({
      description: [ '', [Validators.required, Validators.maxLength(100), Validators.pattern(Regex.LettersNSpaces)]],
      name: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(Regex.LettersNSpaces)]],
      imgSource: ['', [Validators.maxLength(2000000)],]
    });
  }

  ngOnInit() {
    console.log(Regex.LettersNSpaces);
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
}
