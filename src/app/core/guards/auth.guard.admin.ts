import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthGuardAdmin implements CanActivate {
  /**
   *
   */
  constructor(private _authService: AuthService, private _router: Router,private _notificationService:NotificationService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._authService.getAuthInfo()
      .pipe(
        map(info => {
          if (info != null) {
             let isAdmin=info.roles.find(role=>role=="Admin");

            if(!!isAdmin){
              return true;
            }else{
            this._router.navigateByUrl('/');
              this._notificationService.error('You are not allowed to go to this route')
              return false;
            }
          }
          return false;
        }),
        catchError((error: HttpErrorResponse) => {
          // TODO: Define error status codes to handle
          if (error.status === 500 || error.status === 0) {
            this._router.navigate(['/error'], { skipLocationChange: true, queryParams: { status: error.status } });
          }
          return of(false);
        })
      );
  }

}
