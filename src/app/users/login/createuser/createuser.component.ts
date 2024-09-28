import { Component } from '@angular/core';
import { NewUser } from './newUser';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css']
})
export class CreateuserComponent {
  public nUser: NewUser = new NewUser();
  confirmPassword!: string;
  StudentArray : any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;

  username: string = "";
  password: string = "";
  currentaccID = "";


  constructor(private router: Router, private apiService: ApiService) {
    this.getAcc();
  }

  getAcc() {
    this.apiService.getAccounts().subscribe((resultData: any) => {
      this.isResultLoaded = true;
      this.StudentArray = resultData.data;
    });
  }

  register()
  {
    let bodyData = {
      "username": this.nUser.username,
      "password": this.nUser.password,
      "email": this.nUser.email,
      "name": this.nUser.name,
      "isAdmin": 0 // Set isAdmin to 0 by default
    };
    this.apiService.addAccount(bodyData).subscribe((resultData: any) => {
      if (resultData.status === false) {
        Swal.fire(
          'Register fails',
          resultData.message,
          'error'
        );
      } else {

        this.getAcc();
        Swal.fire(
          'User created',
          'Your user has been created successfully, please log in with the data you provided.',
          'success'
        ).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  setUpdate(data: any) 
  {
   this.username = data.username;
   this.password = data.password;
   this.currentaccID = data.userid;
  }

  UpdateRecords()
  {
    let bodyData = 
    {
      "username": this.nUser.username,
      "password": this.nUser.password,
      "email": this.nUser.email,
      "name": this.nUser.name,
      "isAdmin": this.nUser.isAdmin
    };
    
    this.apiService.updateAccount(this.currentaccID, bodyData).subscribe((resultData: any) => {

      alert("Student Registered Updated");
      this.getAcc();
    });
  }
 
  save()
  {
    if(this.currentaccID == '')
    {
        this.register();
    }
    else
    {
       this.UpdateRecords();
    }       
  }

  setDelete(data: any)
  {
    this.apiService.deleteAccount(data.userid).subscribe((resultData: any) => {

      alert("Student Deleted");
      this.getAcc();
    });
  }

  createUser(): void {
    if (this.nUser.password !== this.confirmPassword) {
      Swal.fire(
        'Register fails',
        'Passwords do not match.',
        'error'
      );
      return;
    }

    this.register();
  }
}
