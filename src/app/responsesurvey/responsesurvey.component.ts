import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseSurveyService } from './responsesurvey.service';

import { NotificationEmailService } from './/notification-email.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

import { catchError, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-responsesurvey',
  templateUrl: './responsesurvey.component.html',
  styleUrls: ['./responsesurvey.component.css']
})
export class ResponsesurveyComponent {
  codeSurvey: any;
  
  listOptions!: string[];

  StudentArray: any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;

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
  respondentAddress: string = ""; // Add this line
  
  respondentCivil: string = '';
  respondentIncome: string = "";
  respondentYrgrad: string = "";
  respondentWorkplace: string = "";
  respondentWorkrelevant: string = "";

  form: FormGroup = this.fb.group({
    from_name: '',
    subject: '',
    message: '',
  });

  constructor(
    private responseSurveyService: ResponseSurveyService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationEmailService: NotificationEmailService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.getAllStudent();
  }
  
  ngOnInit(): void {
    this.codeSurvey = this.route.snapshot.paramMap.get('codeSurvey');
  }

  getAllStudent() { 
    this.apiService.getSurveyAnswers().subscribe((resultData: any) => {
      this.isResultLoaded = true;
      
      this.StudentArray = resultData.data;
    });
  }
  
  areAllFieldsFilled(): boolean {
    return this.respondentLastName.trim() !== '' && this.respondentFirstName.trim() !== '' &&
            this.respondentEmail.trim() !== '' && this.respondentAddress.trim() !== '' && // Add this line
            this.respondentContact.trim() !== '' && this.respondentCivil !== '' &&
            this.respondentSex !== '' && this.respondentCourse !== '' &&
            this.respondentYrgrad !== '' && this.respondentStatus !== '' &&
            this.respondentOccupation.trim() !== '' && this.respondentWorkplace !== '' &&
            this.respondentIncome !== '' && this.respondentWorkrelevant !== '';
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await this.apiService.checkEmailExists(email).toPromise();
      return response ?? false; // Use nullish coalescing to handle undefined
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false; // or handle the error as needed
    }
  }
   
  async save() {
    if (this.areAllFieldsFilled()) {
      const emailExists = await this.checkEmailExists(this.respondentEmail);
      if (emailExists) {
        Swal.fire({
          title: 'Email already responded',
          text: "This email has already responded. Do you want to resubmit?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, resubmit it!',
          cancelButtonText: 'No, cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            this.updateResponse();
            this.send();
            this.router.navigate(['/thank-you']);
          }
        });
      } else {
        this.postResponse();
        this.router.navigate(['/thank-you']);
      }
    } else {
      // Show an error message
      alert("Please fill out all fields before submitting.");
    }
  }

  private combineNameFields() {
    this.respondentName = `${this.respondentLastName}, ${this.respondentFirstName} ${this.respondentSuffix}`.trim();
  }

  updateResponse() {
    this.combineNameFields();
    const surveyAnswers = {
      name: this.respondentName,
      email: this.respondentEmail,
      contact_Num: this.respondentContact,
      address: this.respondentAddress, // Add this line
      program: this.respondentCourse,
      occupation: this.respondentOccupation,
      civil_Status: this.respondentCivil,
      sex: this.respondentSex,
      work_Status: this.respondentStatus,
      work_place: this.respondentWorkplace,
      salary: this.respondentIncome,
      firstjob_curriculum: this.respondentWorkrelevant,
      batchYr: this.respondentYrgrad
    };

    this.apiService.updateSurveyAnswerByEmail(this.respondentEmail, surveyAnswers).subscribe(
      (resultData: any) => {
        console.log("Survey answers updated successfully", resultData);
        Swal.fire('Success', 'Your response has been updated!', 'success');
      },
      (error) => {
        console.error("Error updating survey answers", error);
        Swal.fire('Error', 'There was an error updating your response.', 'error');
      }
    );
  }

  postResponse() {
    this.combineNameFields();
    const surveyAnswers = {
      name: this.respondentName,
      email: this.respondentEmail,
      contact_Num: this.respondentContact,
      address: this.respondentAddress, // Add this line
      program: this.respondentCourse,
      occupation: this.respondentOccupation,
      civil_Status: this.respondentCivil,
      sex: this.respondentSex,
      work_Status: this.respondentStatus,
      work_place: this.respondentWorkplace,
      salary: this.respondentIncome,
      firstjob_curriculum: this.respondentWorkrelevant,
      batchYr: this.respondentYrgrad
    };

    this.apiService.addSurveyAnswer(surveyAnswers).subscribe(
      (resultData: any) => {
        console.log("Survey answers submitted successfully", resultData);
        Swal.fire('Success', 'Your response has been submitted!', 'success');
      },
      (error) => {
        console.error("Error submitting survey answers", error);
        Swal.fire('Error', 'There was an error submitting your response.', 'error');
      }
    );
  }
  
  async send() {
    emailjs.init('dvlxI8tYN4h56KhEL');
    let response = await emailjs.send('service_ztb5vrq', 'template_pftvmgp', {
      to_email: "formalytics24@gmail.com",
      subject: "New Respondent(s)",
      messsage: "Formalytics got a new Respondent(s).",
    });
    this.form.reset();
  }
}