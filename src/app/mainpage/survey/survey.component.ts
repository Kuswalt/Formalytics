import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Category } from './category';
import { Survey } from './survey';
import { SurveyService } from './survey.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})

export class SurveyComponent implements OnInit {
  public categories!: Category[];
  public actualCategory: number = 5;
  subtitle!:string;
  surveys: Survey[] = [];
  public questions!: string[];
  currentPage = 1;

  respondentLastName: string = "";
  respondentFirstName: string = "";
  respondentSuffix: string = "";
  respondentCourse: string = "";
  respondentOccupation: string = "";
  respondentStatus: string = "";
  respondentName: string = ""; // This will be combined from last name, first name, and suffix
  respondentEmail: string = "";
  respondentContact: string = "";
  respondentSex: string = "";
  currentStudentID = "";
  respondentCivil: string = '';
  respondentIncome: string = "";
  respondentYrgrad: string = "";
  respondentAddress: string = "";
  respondentWorkplace: string = "";
  respondentWorkrelevant: string = "";
  primaryUserId: string = '';


  randomCode: string = '';

  constructor(private surveyService: SurveyService, private clipboard: Clipboard,
    private router: Router, private cdr: ChangeDetectorRef, private apiService: ApiService) { }

  ngOnInit(): void {
    // this.randomCode = this.generateRandomString(8);
    
  }

  // generateRandomString(length: number): string {
  //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   let result = '';
  //   const charactersLength = characters.length;
  //   for (let i = 0; i < length; i++) {
  //     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  //   }
  //   return result;
  // }

  public copyLink(codeSurvey: string) {
    // this.randomCode = this.generateRandomString(8); // Regenerate randomCode
    this.clipboard.copy('https://alumnisurvey.formalytics.me/');
    alert('link copied!!');
    this.router.navigate(['/survey']);
  }

  // Method to combine the name fields before posting to the database
  private combineNameFields() {
    this.respondentName = `${this.respondentLastName}, ${this.respondentFirstName} ${this.respondentSuffix}`.trim();
  }

  // Example method to post data to the database
  public postData() {
    this.combineNameFields();
    // Now use this.respondentName to post to the database
    // Example:
    // this.apiService.postData({ name: this.respondentName, ...otherFields }).subscribe(response => {
    //   // Handle response
    // });
  }
}