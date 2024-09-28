import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost/alumni/api/'; // Ensure the URL uses HTTPS

  constructor(private http: HttpClient) { }

  private handleError(error: any) {
    console.error('API call error:', error); // Log detailed error on the server
    return throwError('Something bad happened; please try again later.');
  }

  addAccount(account: any): Observable<any> {
    return this.http.post(`${this.baseUrl}add-account`, account)
      .pipe(catchError(this.handleError));
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login`, credentials)
      .pipe(
        map((response: any) => {
          if (!response || !response.status) {
            throw new Error('Invalid response from server');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}get-accounts`)
      .pipe(catchError(this.handleError));
  }

  deleteAccount(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete-account/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateAccount(id: string, bodyData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}update-account/${id}`, bodyData)
      .pipe(catchError(this.handleError));
  }

  getAlumniList(): Observable<any> {
    return this.http.get(`${this.baseUrl}get-alumni-list`)
      .pipe(catchError(this.handleError));
  }

  updateAlumniList(id: string, student: any): Observable<any> {
    return this.http.put(`${this.baseUrl}update-alumni-list-by-id/${id}`, student)
      .pipe(catchError(this.handleError));
  }

  deleteAlumniList(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete-alumni-list-by-id/${id}`)
      .pipe(catchError(this.handleError));
  }

  addMultipleAlumni(students: any[]): Observable<any> {
    console.log('Sending students data to API:', students); // Log the data being sent
    return this.http.post(`${this.baseUrl}add-multiple-students`, students)
      .pipe(
        catchError(this.handleError)
      );
  }

  addAlumni(student: any): Observable<any> {
    return this.http.post(`${this.baseUrl}add-student`, student)
      .pipe(catchError(this.handleError));
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}check-email-existence/${email}`)
      .pipe(catchError(this.handleError));
  }

  updateSurveyAnswerByEmail(email: string, surveyAnswers: any): Observable<any> {
    return this.http.put(`${this.baseUrl}update-survey-answer-by-email/${email}`, surveyAnswers)
      .pipe(catchError(this.handleError));
  }

  addSurveyAnswer(surveyAnswers: any): Observable<any> {
    return this.http.post(`${this.baseUrl}add-survey-answer`, surveyAnswers)
      .pipe(catchError(this.handleError));
  }

  getSurveyAnswers(): Observable<any> {
    return this.http.get(`${this.baseUrl}get-survey-answers`)
      .pipe(catchError(this.handleError));
  }

  updateSurveyAnswer(id: string, surveyAnswers: any): Observable<any> {
    return this.http.put(`${this.baseUrl}update-survey-answer-by-id/${id}`, surveyAnswers)
      .pipe(catchError(this.handleError));
  }

  deleteSurveyAnswer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete-survey-answer-by-id/${id}`)
      .pipe(catchError(this.handleError));
  }

  sendEmail(subject: string, body: string, to: string): Promise<void> {
    return fetch(`${this.baseUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject, body, to })
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    });
  }

  findSurveyByCodeSurvey(codeSurvey: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveygenerator/surveys/findbycodesurvey/${codeSurvey}`)
      .pipe(catchError(this.handleError));
  }

  saveResponses(codeSurvey: string, responses: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/surveygenerator/surveys/responsesurvey/${codeSurvey}`, responses)
      .pipe(catchError(this.handleError));
  }

  getUserDetails(userid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}get-user-details/${userid}`)
      .pipe(catchError(this.handleError));
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}get-survey-answer-by-id/${id}`)
      .pipe(catchError(this.handleError));
  }

  getStudentsByIds(ids: string[]): Observable<any> {
    const idsParam = ids.join(',');
    return this.http.get(`${this.baseUrl}get-survey-answers&ids=${idsParam}`)
      .pipe(catchError(this.handleError));
  }

  archiveStudents(students: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}archive-students`, { students })
      .pipe(catchError(this.handleError));
  }

  restoreStudents(students: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}restore-students`, { students })
      .pipe(catchError(this.handleError));
  }

  // Add this method to archive respondents
  archiveRespondents(respondents: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN' // Replace with your actual token
    });

    return this.http.post(`${this.baseUrl}archive-respondents`, { respondents }, { headers })
      .pipe(catchError(this.handleError));
  }

  // Add this method to fetch archived respondents
  getArchivedRespondents(): Observable<any> {
    return this.http.get(`${this.baseUrl}get-archived-respondents`)
      .pipe(catchError(this.handleError));
  }

  getSurveyAnswersByIds(ids: string[]): Observable<any> {
    const idsParam = ids.join(',');
    return this.http.get(`${this.baseUrl}get-survey-answers-by-ids/${idsParam}`)
      .pipe(catchError(this.handleError));
  }
}