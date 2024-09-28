import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { LoginService } from '../users/login/login.service';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import * as Plotly from 'plotly.js-dist-min';
import { ApiService } from 'src/app/api.service';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/student.service';
import { RespondentDataService } from './respondent-data.service';

interface StudentData {
  id: string;
  batchYr: string;
  program: string;
  name: string;
  email: string;
  contact_Num: string;
  work_Status: string;
  occupation: string;
}

@Component({
  selector: 'app-respondent-data',
  templateUrl: './respondent-data.component.html',
  styleUrls: ['./respondent-data.component.css']
})
export class RespondentDataComponent implements OnInit {
  StudentArray: any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;

  employedCount = 0;
  unemployedCount = 0;
  seekingEmploymentCount = 0;

  name: string = "";
  email: string = "";
  contact_Num: string = "";
  program: string = "";
  occupation: string = "";
  civil_Status: string = "";
  sex: string = '';
  work_Status: string = '';
  batchYr: string = '';
  salary: string = '';
  firstjob_curriculum: string = '';
  work_place: string = '';

  currentStudentID = "";
  searchText: string = '';
  searchSurvey: string = '';
  selectedCourse: string = 'ALL CATEGORIES';
  selectedBatchYr: string = 'ALL YEARS';
  loadingCharts: boolean = false;

  students: any[] = [];

  programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };

  selectAll: boolean = false;
  showArchiveModal: boolean = false; // Added this line

  applyFiltersAndUpdateCharts(): void {
    this.updateEmploymentCounts(this.filteredStudents);
    this.updateProgramCounts();
    this.initCharts();
  }

  constructor(private apiService: ApiService, private userService: UserService, private loginService: LoginService, private router: Router, private studentService: StudentService, private respondentDataService: RespondentDataService) {
    this.students = [];
  }

  ngOnInit(): void {
    this.getAllStudent();
  }

  private initCharts(): void {
    this.loadingCharts = true;
    const barChartElement = document.getElementById('barChart1');
    const pieChartElement = document.getElementById('pieChart1');

    if (barChartElement && pieChartElement) {
      const xArray = [this.programCounts.BSCS, this.programCounts.BSIT, this.programCounts.BSEMC, this.programCounts.ACT];
      const yArray = ["BSCS", "BSIT", "BSEMC", "ACT"];
      const barData1 = [{
        x: xArray,
        y: yArray,
        type: 'bar' as 'bar',
        orientation: "h" as 'h'
      }];

      const data1 = [{
        values: [this.employedCount, this.unemployedCount, this.seekingEmploymentCount],
        labels: ['Employed', 'Unemployed', 'Seeking Employment'],
        type: 'pie' as 'pie',
        hole: .2,
        pull: [0.01, 0.01, 0.01]
      }];

      const layout = {
        height: 450,
        width: 450,
        font: {
          size: 12
        },
        legend: {
          font: {
            size: 10
          }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        description: "Employment Ratio",
        transition: {
          duration: 500,
          easing: 'cubic-in-out' as 'cubic-in-out'
        },
        frame: {
          duration: 500
        }
      };
      const barlayout = {
        height: 350,
        width: 800,
        font: {
          size: 16
        },
        legend: {
          font: {
            size: 16
          }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        title: "Population Sample",
        transition: {
          duration: 500,
          easing: 'cubic-in-out' as 'cubic-in-out'
        },
        frame: {
          duration: 500
        }
      };

      Plotly.newPlot(barChartElement, barData1, barlayout).then(() => {
        this.loadingCharts = false;
      });
      Plotly.newPlot(pieChartElement, data1, layout).then(() => {
        this.loadingCharts = false;
      });
    } else {
      this.loadingCharts = false;
    }
  }

  getAllStudent() {
    this.apiService.getSurveyAnswers().subscribe((resultData: any) => {
      this.isResultLoaded = true;
      this.StudentArray = resultData.data.map(({ id, batchYr, program, name, email, contact_Num, work_Status, occupation }: StudentData) => ({
        id,
        batchYr,
        program,
        name,
        email,
        contact_Num,
        work_Status,
        occupation
      }));
      this.updateEmploymentCounts(this.StudentArray);
      this.updateProgramCounts();
      this.initCharts();
    });
  }

  updateProgramCounts() {
    this.programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };

    const studentsToCount = this.filteredStudents;

    studentsToCount.forEach(student => {
      switch (student.program) {
        case 'BSCS':
          this.programCounts.BSCS++;
          break;
        case 'BSIT':
          this.programCounts.BSIT++;
          break;
        case 'BSEMC':
          this.programCounts.BSEMC++;
          break;
        case 'ACT':
          this.programCounts.ACT++;
          break;
      }
    });

    this.initCharts();
  }

  updateEmploymentCounts(students: any[]) {
    this.employedCount = 0;
    this.unemployedCount = 0;
    this.seekingEmploymentCount = 0;

    students.forEach(student => {
      const firstChar = student.work_Status[0].toLowerCase();
      switch (firstChar) {
        case 'e':
          this.employedCount++;
          break;
        case 'u':
          this.unemployedCount++;
          break;
        case 's':
          this.seekingEmploymentCount++;
          break;
      }
    });
  }

  get filteredStudents() {
    const filtered = this.StudentArray.filter(student => {
      const matchesCourse = this.selectedCourse === 'ALL CATEGORIES' || student.program === this.selectedCourse;
      const matchesBatchYr = this.selectedBatchYr === 'ALL YEARS' || student.batchYr.toString() === this.selectedBatchYr.toString();
      const matchesName = student.name.toLowerCase().split(' ').some((word: string) =>
        word.startsWith(this.searchSurvey.toLowerCase())
      );

      return matchesCourse && matchesBatchYr && matchesName;
    });

    this.updateEmploymentCounts(filtered);
    return filtered;
  }

  register() {
    let bodyData = {
      "name": this.name,
      "email": this.email,
      "contact_Num": this.contact_Num,
      "program": this.program,
      "work_Status": this.work_Status,
      "occupation": this.occupation,
      "batchYr": this.batchYr
    };
    this.apiService.addSurveyAnswer(bodyData).subscribe((resultData: any) => {
      alert("Employee Registered Successfully");
      this.getAllStudent();
    });
  }

  setUpdate(data: any) {
    this.studentService.setStudentId(data.id); // Set the student ID in the service
    this.router.navigate(['/edit-student', data.id]); // Navigate to the edit-student route with the student ID
  }

  UpdateRecords() {
    let bodyData = {
      "name": this.name,
      "email": this.email,
      "contact_Num": this.contact_Num,
      "program": this.program,
      "work_Status": this.work_Status,
      "occupation": this.occupation,
      "batchYr": this.batchYr
    };

    this.apiService.updateSurveyAnswer(this.currentStudentID, bodyData).subscribe((resultData: any) => {
      alert("Student Updated");
      this.getAllStudent();
    }, error => {
      console.error('Error updating student:', error);
      alert("Error updating student. Please try again.");
    });
  }

  save() {
    if (this.currentStudentID == '') {
      this.register();
    }
    else {
      this.UpdateRecords();
    }
  }

  setDelete(studentItem: any) {
    if (confirm("Are you sure you want to delete this student?")) {
      this.apiService.deleteSurveyAnswer(studentItem.id).subscribe((resultData: any) => {
        alert("Student Deleted");
        this.getAllStudent();
      }, error => {
        console.error('Error deleting student:', error);
        alert("Error deleting student. Please try again.");
      });
    }
  }

  downloadExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredStudents);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    XLSX.writeFile(wb, 'students.xlsx');
  }

  downloadArchivedExcel(data: any[]) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Archived Respondents');

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.-]/g, '');
    const filename = `archived_respondents_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);
  }

  archiveAndDownload() {
    this.respondentDataService.archiveAndDownload(this.filteredStudents);
  }

  openArchiveModal() {
    this.showArchiveModal = true;
  }

  closeArchiveModal() {
    this.showArchiveModal = false;
  }

  toggleSelectAll() {
    this.filteredStudents.forEach(student => {
      student.selected = this.selectAll;
    });
  }

  archiveSelected() {
    const selectedRespondents = this.filteredStudents.filter(respondent => respondent.selected);
    
    if (selectedRespondents.length === 0) {
      alert("No respondents selected for archiving.");
      return;
    }

    const selectedIds = selectedRespondents.map(respondent => respondent.id);

    this.apiService.getSurveyAnswersByIds(selectedIds).subscribe(
      (response: any) => {
        if (response.status) {
          const respondentsToArchive = response.data;

          this.apiService.archiveRespondents(respondentsToArchive).subscribe(
            (archiveResponse: any) => {
              alert("Selected respondents archived successfully.");
              
              // Delete archived respondents from the survey answer table
              const deleteRequests = selectedIds.map(id => 
                this.apiService.deleteSurveyAnswer(id).toPromise()
              );

              Promise.all(deleteRequests).then(() => {
                alert("Archived respondents deleted successfully.");
                this.getAllStudent(); // Refresh the student list
              }).catch(error => {
                console.error('Error deleting respondents:', error);
                alert("Error deleting respondents. Please try again later.");
              });
              this.downloadArchivedExcel(respondentsToArchive);
            },
            (archiveError: any) => {
              console.error('Error archiving respondents:', archiveError);
              alert("Error archiving respondents. Please try again later.");
            }
          );
        } else {
          alert("Error fetching respondents data. Please try again later.");
        }
      },
      (fetchError: any) => {
        console.error('Error fetching respondents data:', fetchError);
        alert("Error fetching respondents data. Please try again later.");
      }
    );

    this.closeArchiveModal();
  }
}