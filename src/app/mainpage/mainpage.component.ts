import { Component, HostBinding } from '@angular/core';
import { OnInit } from '@angular/core';
import { Suggestion } from './suggestion';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})

export class MainpageComponent {
  suggestion: Suggestion = new Suggestion();

  constructor(private apiService: ApiService, private router: Router) { }

  
}