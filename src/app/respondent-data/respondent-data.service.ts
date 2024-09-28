import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { ApiService } from '../api.service'; // Import ApiService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespondentDataService {
  private respondentNameSource = new BehaviorSubject<string>('');
  respondentName$ = this.respondentNameSource.asObservable();

  private respondentEmailSource = new BehaviorSubject<string>('');
  respondentEmail$ = this.respondentEmailSource.asObservable();

  constructor(private apiService: ApiService) { }

  setRespondentData(name: string, email: string) {
    this.respondentNameSource.next(name);
    this.respondentEmailSource.next(email);
  }

  archiveAndDownload(filteredRespondents: any[]) {
    // Archive the data
    this.archiveRespondents(filteredRespondents).subscribe({
      next: (response) => {
        console.log('Respondents archived successfully', response);
        alert('Respondents archived successfully');
        // Download the archived data as an Excel file
        this.downloadArchivedData(filteredRespondents);
      },
      error: (error) => {
        console.error('Error archiving respondents:', error);
        alert('Error archiving respondents. Please try again.');
      }
    });
  }

  public archiveRespondents(respondents: any[]): Observable<any> {
    return this.apiService.archiveRespondents(respondents);
  }

  private downloadArchivedData(archivedRespondents: any[]) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(archivedRespondents);
    const workbook: XLSX.WorkBook = { Sheets: { 'Archived Respondents': worksheet }, SheetNames: ['Archived Respondents'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Archived_Respondents');
  }

  private saveAsExcelFile(buffer: any, baseFileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(data);

    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Format the date and time
    const dateTime = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

    // Create the full filename
    const fileName = `${baseFileName}_${dateTime}.xlsx`;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }
}