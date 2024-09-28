import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/api.service';

@Injectable({
  providedIn: 'root'  // This ensures the service is a singleton
})
export class UserService {
  private usernameSubject = new BehaviorSubject<string>('');
  private isLoginSubject = new BehaviorSubject<boolean>(false);

  username$ = this.usernameSubject.asObservable();
  isLogin$ = this.isLoginSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.isLoginSubject.next(this.checkLoginStatus());
    this.usernameSubject.next(this.getUsername());
  }

  setUsername(username: string) {
    this.usernameSubject.next(username);
  }

  setIsLogin(isLogin: boolean) {
    this.isLoginSubject.next(isLogin);
  }

  logout() {
    this.setUsername('');
    this.setIsLogin(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  }

  login(username: string) {
    this.setIsLogin(true);
    this.setUsername(username);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
  }

  checkLoginStatus(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  // Example method to get user details
  getUserDetails(userid: string) {
    return this.apiService.getUserDetails(userid);
  }
}