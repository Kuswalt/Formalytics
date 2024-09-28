import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Survey, UserResponse } from './responsesurvey';
import { ApiService } from 'src/app/api.service';

@Injectable({
  providedIn: 'root'
})
export class ResponseSurveyService {

  constructor(private apiService: ApiService) { }

  findSurveyByCodeSurvey(codeSurvey: string): Observable<Survey> {
    return this.apiService.findSurveyByCodeSurvey(codeSurvey);
  }

  saveResponses(codeSurvey: string, responses: UserResponse): Observable<UserResponse> {
    return this.apiService.saveResponses(codeSurvey, responses);
  }

  getUserDetails(userid: string): Observable<any> {
    return this.apiService.getUserDetails(userid);
  }
}