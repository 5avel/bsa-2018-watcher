import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public authService: AuthService, public router: Router) {}

  canActivate(): boolean {

    if ((this.authService.isAuthorized())) {
      console.log(this.authService.isAuthorized());
      return true;
    } else {
      console.log(this.authService.isAuthorized());
      this.router.navigate(['/user/dashboards']);
      return false;
    }

  }
}
