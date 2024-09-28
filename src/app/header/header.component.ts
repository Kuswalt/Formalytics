import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  username: string = '';
  isLogin: boolean = false;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.username$.subscribe(username => this.username = username);
    this.userService.isLogin$.subscribe(isLogin => this.isLogin = isLogin);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  isMainPage() {
    return this.router.url === '/';
  }
}