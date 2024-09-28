import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';  // Import UserService

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private userService: UserService) {}  // Inject UserService

  isLoggedIn(): boolean {
    let isLoggedIn = false;
    this.userService.isLogin$.subscribe(isLogin => isLoggedIn = isLogin);
    return isLoggedIn;
  }
}