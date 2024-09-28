import { Injectable } from '@angular/core';
import { Category } from './category';
import { Survey } from './survey';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from 'src/app/api.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  constructor(private apiService: ApiService) {}

  getCategories(): Observable<Category[]> {
    return this.apiService.getAccounts();
  }

  getSurveys(idCategory: number): Observable<Survey[]> {
    return this.apiService.getAlumniList();
  }

  deleteSurvey(surveyId: number): Observable<Survey> {
    return this.apiService.deleteAlumniList(surveyId.toString());
  }
}