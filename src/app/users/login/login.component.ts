import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private apiService: ApiService, private userService: UserService) { }

  loginUser() {
    const loginData = { username: this.username, password: this.password };

    this.apiService.login(loginData).subscribe(
      response => {
        if (response.status) {
          this.userService.setUsername(this.username);
          this.userService.setIsLogin(true);
          if (response.isAdmin === 1) {
            this.router.navigate(['/dashboard']);
          } else {
            this.showErrorDialog('Account is not yet approved by the developers.');
          }
        } else {
          this.showErrorDialog(response.message);
        }
      },
      error => {
        if (error.status === 404) {
          this.showErrorDialog("Account doesn't exist");
        } else if (error.status === 401) {
          this.showErrorDialog("Incorrect credentials");
        } else {
          this.showErrorDialog('An error occurred during login.');
        }
        console.error('Login error:', error);
      }
    );
  }

  showErrorDialog(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'Close'
    });
  }
}