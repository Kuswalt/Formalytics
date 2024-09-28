import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import * as Plotly from 'plotly.js-dist-min';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/api.service';

interface StudentData {
  id: string;
  batchYr: string;
  program: string;
  sex: string;
  civil_Status: string;
  work_place: string;
  salary: string;
  work_Status: string;
  occupation: string;
  firstjob_curriculum: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  StudentArray : any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;

  employedCount = 0;
  unemployedCount = 0;
  seekingEmploymentCount = 0;

  correlatedCount = 0;
  notCorrelatedCount = 0;
  naCount = 0;

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
  work_place: string ='';
  
  currentStudentID = "";
  searchText: string = '';
  searchSurvey: string = ''; 
  selectedCourse: string = 'ALL CATEGORIES'; 
  selectedBatchYr: string = 'ALL YEARS';
  loadingCharts: boolean = false;

  students: any[] = [];  // Initialize the students property with an empty array

  programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };
  isCollapsed: boolean = true;

  employmentStatistics: string = '';
  employmententerpretation: string = '';
  employmentgenderStatistics: string = '';
  employmentgenderenterpretation: string = '';
  correlationStatistics: string = '';
  correlationInterpretation: string = '';
  employmentrate: string = '';

  applyFiltersAndUpdateCharts(): void {
    this.updateEmploymentCounts(this.filteredStudents);
    this.updateProgramCounts();
    this.createCharts(); 
    this.updateStatistics();  // Ensure statistics are updated after charts
  }

  constructor(private apiService: ApiService) {
    this.students = [];
  }

  ngOnInit(): void {
    this.getAllStudent();
  }

  createCharts() {
    this.updateEmploymentCounts(this.filteredStudents);
   
    const data1 = [{
      values: [this.employedCount, this.unemployedCount, this.seekingEmploymentCount], // Use actual counts
      labels: ['Employed', 'Unemployed', 'Seeking Employment'],
      type: 'pie' as 'pie',
      hole: .2,
      pull: [0.01, 0.01, 0.01]
    }];

    const data2 = [{
      values: [
        this.filteredStudents.filter(student => student.firstjob_curriculum === 'Yes').length,
        this.filteredStudents.filter(student => student.firstjob_curriculum === 'No').length,
        this.filteredStudents.filter(student => student.firstjob_curriculum === 'n/a').length
      ],
      labels: ['Correlated', 'Not Correlated', 'N/A'],
      type: 'pie' as 'pie',
      hole: .2,
      pull: [0.01, 0.01, 0.01]
    }];

    const data3 = [{
      values: [this.femaleCount, this.maleCount],
      labels: ['Female', 'Male'],
      type: 'pie' as 'pie',
      hole: .2,
      pull: [0.01, 0.01, 0.01]
    }];

    const layout = {
      height: 450, // Increased height
      width: 450, // Increased width
      font: {
        size: 12 // Increase the font size
      },
      legend: {
        font: {
          size: 10 // Increase the legend font size
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      plot_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      description: "Correlation Ratio",
      transition: {
        duration: 500,
        easing: 'cubic-in-out' as 'cubic-in-out'
      },
      frame: {
        duration: 500
      }
    };

    const layout2 = {
      height: 450, // Increased height
      width: 450, // Increased width
      font: {
        size: 12 // Increase the font size
      },
      legend: {
        font: {
          size: 10 // Increase the legend font size
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      plot_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      description: "Employment Ratio",
      transition: {
        duration: 500,
        easing: 'cubic-in-out' as 'cubic-in-out'
      },
      frame: {
        duration: 500
      }
    };

    const layout3 = {
      height: 450, // Increased height
      width: 450, // Increased width
      font: {
        size: 12 // Increase the font size
      },
      legend: {
        font: {
          size: 10 // Increase the legend font size
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      plot_bgcolor: 'rgba(0,0,0,0)', // Transparent background
      description: "Gender Ratio",
      transition: {
        duration: 500,
        easing: 'cubic-in-out' as 'cubic-in-out'
      },
      frame: {
        duration: 500
      }
    };

    // Example data for the horizontal group bar chart
    const trace1 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 'e').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 'e').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 'e').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 'e').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'Employed',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const trace2 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 'u').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 'u').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 'u').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 'u').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'Unemployed',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const trace3 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 's').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 's').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 's').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 's').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'Seeking Employment',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const data = [trace1, trace2, trace3];
    const barlayout = {
      barmode: 'group' as 'group',
      title: 'Employment Status by Program',
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };

    const ttrace1 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'Yes').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'Yes').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'Yes').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'Yes').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'Correlated',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const ttrace2 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'No').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'No').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'No').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'No').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'Not Correlated',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const ttrace3 = {
      x: [this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'n/a').length,
          this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'n/a').length,
          this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'n/a').length,
          this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'n/a').length],
      y: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
      name: 'N/A',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const bardata2 = [ttrace1, ttrace2, ttrace3];
    const barlayout2 = {
      barmode: 'group' as 'group',
      title: 'Work to Course Correlation',
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };

    const tttrace1 = {
      x: [this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 'e').length,
          this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 'e').length],
      y: ['Female', 'Male'],
      name: 'Employed',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const tttrace2 = {
      x: [this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 'u').length,
          this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 'u').length],
      y: ['Female', 'Male'],
      name: 'Unemployed',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const tttrace3 = {
      x: [this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 's').length,
          this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 's').length],
      y: ['Female', 'Male'],
      name: 'Seeking Employment',
      type: 'bar' as 'bar',
      orientation: 'h' as 'h'
    };

    const bardata3 = [tttrace1, tttrace2, tttrace3];
    const barlayout3 = {
      barmode: 'group' as 'group',
      title: 'Work Status by Gender',
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };

    Plotly.newPlot('pieChart1', data1, layout);
    Plotly.newPlot('pieChart2', data2, layout2);
    Plotly.newPlot('pieChart3', data3, layout3);
    Plotly.newPlot('barChart1', data, barlayout);
    Plotly.newPlot('barChart2', bardata2, barlayout2);
    Plotly.newPlot('barChart3', bardata3, barlayout3);

    this.updateStatistics();  // Ensure statistics are updated after charts
  }

  getAllStudent() { 
    this.apiService.getSurveyAnswers()
      .subscribe((resultData: any) => {
        this.isResultLoaded = true;
        this.StudentArray = resultData.data.map(({ id, batchYr, program, sex, civil_Status, work_place, salary, work_Status, occupation, firstjob_curriculum }: StudentData) => ({
          id,
          batchYr,
          program,
          sex,
          civil_Status,
          work_place,
          salary,
          work_Status,
          occupation,
          firstjob_curriculum
        }));
        this.updateEmploymentCounts(this.StudentArray);
        this.updateProgramCounts();
        this.createCharts();
        this.updateStatistics();
      });
  }

  updateProgramCounts() {
    this.programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };

    // Count students in each program from the currently displayed list (filtered or all)
    const studentsToCount = this.filteredStudents; // Assuming filteredStudents returns the currently displayed list

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

    // After updating the counts, reinitialize the charts to reflect the new data
  }

  updateEmploymentCounts(students: any[]) {
    this.employedCount = 0;
    this.unemployedCount = 0;
    this.seekingEmploymentCount = 0;

    students.forEach(student => {
      const firstChar = student.work_Status[0].toLowerCase(); // Get the first character and convert to lowercase
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
      return (this.selectedCourse === 'ALL CATEGORIES' || student.program === this.selectedCourse) &&
             (this.selectedBatchYr === 'ALL YEARS' || student.batchYr.toString() === this.selectedBatchYr.toString()); // Compare as string
    });
    this.updateEmploymentCounts(filtered);  // Update counts based on filtered data
    return filtered;
  }

  ngAfterViewInit() {
    this.getAllStudent();
  }

  printDashboard() {
    const printContents = document.getElementById('Analysis-content1')!.innerHTML; // Added non-null assertion operator
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore the original content
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  get femaleCount(): number {
    return this.filteredStudents.filter(student => student.sex === 'Female').length;
  }

  get maleCount(): number {
    return this.filteredStudents.filter(student => student.sex === 'Male').length;
  }

  updateStatistics() {
    const bscsEmployed = this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 'e').length;
    const bscsUnemployed = this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 'u').length;
    const bscsSeeking = this.filteredStudents.filter(student => student.program === 'BSCS' && student.work_Status[0].toLowerCase() === 's').length;

    const bsitEmployed = this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 'e').length;
    const bsitUnemployed = this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 'u').length;
    const bsitSeeking = this.filteredStudents.filter(student => student.program === 'BSIT' && student.work_Status[0].toLowerCase() === 's').length;

    const bsemcEmployed = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 'e').length;
    const bsemcUnemployed = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 'u').length;
    const bsemcSeeking = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.work_Status[0].toLowerCase() === 's').length;

    const actEmployed = this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 'e').length;
    const actUnemployed = this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 'u').length;
    const actSeeking = this.filteredStudents.filter(student => student.program === 'ACT' && student.work_Status[0].toLowerCase() === 's').length;

    const totalEmployed = bscsEmployed + bsitEmployed + bsemcEmployed + actEmployed;
    const totalUnemployed = bscsUnemployed + bsitUnemployed + bsemcUnemployed + actUnemployed;
    const totalSeeking = bscsSeeking + bsitSeeking + bsemcSeeking + actSeeking;
    const totalStudents = totalEmployed + totalUnemployed + totalSeeking;

    const employedPercentage = ((totalEmployed / totalStudents) * 100).toFixed(1);
    const unemployedPercentage = ((totalUnemployed / totalStudents) * 100).toFixed(1);
    const seekingPercentage = ((totalSeeking / totalStudents) * 100).toFixed(1);

    // Determine the course with the highest number of employed graduates
    const employedCounts: { [key: string]: number } = { BSCS: bscsEmployed, BSIT: bsitEmployed, BSEMC: bsemcEmployed, ACT: actEmployed };
    const employedCourse = Object.keys(employedCounts).reduce((a, b) => employedCounts[a] > employedCounts[b] ? a : b);

    // Determine the course with the highest number of graduates seeking employment
    const seekingCounts: { [key: string]: number } = { BSCS: bscsSeeking, BSIT: bsitSeeking, BSEMC: bsemcSeeking, ACT: actSeeking };
    const seekingCourse = Object.keys(seekingCounts).reduce((a, b) => seekingCounts[a] > seekingCounts[b] ? a : b);

    this.employmentStatistics = `The employment status of graduates across different programs shows notable differences. For the ACT (Associate in Computer Technology) program, ${actSeeking} graduates are seeking employment, ${actEmployed} currently employed, and ${actUnemployed} unemployed. the BSEMC (Bachelor of Science in Entertainment and Multimedia Computing) program has ${bsemcSeeking} graduates seeking employment, ${bsemcEmployed} employed, and ${bsemcUnemployed} for unemployed. In the BSIT (Bachelor of Science in Information Technology) program, ${bsitSeeking} graduate is seeking employment, with ${bsitEmployed} graduates currently employed, and ${bsitUnemployed} for unemployed. the BSCS (Bachelor of Science in Computer Science) program has ${bscsEmployed} employed and ${bscsUnemployed} unemployed, while ${bscsSeeking} are seeking employment. Overall, ${employedPercentage}% of graduates are employed, ${unemployedPercentage}% are unemployed, and ${seekingPercentage}% are actively seeking employment.`;
    this.employmententerpretation = `${employedCourse} program has the highest number of employed graduates, suggesting that it may have better job placement or higher demand in the job market compared to other programs. ${seekingCourse} graduates are predominantly seeking employment, indicating potential challenges in finding jobs or possibly the timing of their job search.`;

    const bscsCorrelated = this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'Yes').length;
    const bscsNotCorrelated = this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'No').length;
    const bscsNA = this.filteredStudents.filter(student => student.program === 'BSCS' && student.firstjob_curriculum === 'n/a').length;

    const bsitCorrelated = this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'Yes').length;
    const bsitNotCorrelated = this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'No').length;
    const bsitNA = this.filteredStudents.filter(student => student.program === 'BSIT' && student.firstjob_curriculum === 'n/a').length;

    const bsemcCorrelated = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'Yes').length;
    const bsemcNotCorrelated = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'No').length;
    const bsemcNA = this.filteredStudents.filter(student => student.program === 'BSEMC' && student.firstjob_curriculum === 'n/a').length;

    const actCorrelated = this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'Yes').length;
    const actNotCorrelated = this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'No').length;
    const actNA = this.filteredStudents.filter(student => student.program === 'ACT' && student.firstjob_curriculum === 'n/a').length;

    const totalCorrelated = bscsCorrelated + bsitCorrelated + bsemcCorrelated + actCorrelated;
    const totalNotCorrelated = bscsNotCorrelated + bsitNotCorrelated + bsemcNotCorrelated + actNotCorrelated;
    const totalNA = bscsNA + bsitNA + bsemcNA + actNA;
    const totalStudentsCorrelation = totalCorrelated + totalNotCorrelated + totalNA; // Renamed variable

    const correlatedPercentage = ((totalCorrelated / totalStudentsCorrelation) * 100).toFixed(1);
    const notCorrelatedPercentage = ((totalNotCorrelated / totalStudentsCorrelation) * 100).toFixed(1);
    const naPercentage = ((totalNA / totalStudentsCorrelation) * 100).toFixed(1);

    const correlatedCounts: { [key: string]: number } = { BSCS: bscsCorrelated, BSIT: bsitCorrelated, BSEMC: bsemcCorrelated, ACT: actCorrelated };
    const highestCorrelatedCourse = Object.keys(correlatedCounts).reduce((a, b) => correlatedCounts[a] > correlatedCounts[b] ? a : b);
     
    const notCorrelatedCounts: { [key: string]: number } = { BSCS: bscsNotCorrelated, BSIT: bsitNotCorrelated, BSEMC: bsemcNotCorrelated, ACT: actNotCorrelated };
    const highestNotCorrelatedCourse = Object.keys(notCorrelatedCounts).reduce((a, b) => notCorrelatedCounts[a] > notCorrelatedCounts[b] ? a : b);

    this.correlationStatistics = `The correlation between graduates' work and their course of study varies across different programs. For the ACT (Associate in Computer Technology) program, ${actNA} graduates are in jobs classified as N/A, with ${actCorrelated} correlated and ${actNotCorrelated} not correlated. The BSEMC (Bachelor of Science in Entertainment and Multimedia Computing) program has ${bsemcCorrelated} graduate in correlated jobs, ${bsemcNA} in N/A, and ${bsemcNotCorrelated} not correlated. In the BSIT (Bachelor of Science in Information Technology) program, ${bsitNA} graduates are in jobs classified as N/A, with ${bsitCorrelated} correlated and ${bsitNotCorrelated} not correlated. The BSCS (Bachelor of Science in Computer Science) program has ${bscsCorrelated} graduates in correlated jobs, ${bscsNotCorrelated} in not correlated, and ${bscsNA} in N/A. Overall, ${notCorrelatedPercentage}% of graduates have jobs not related to their course of study, ${correlatedPercentage}% have correlated jobs, and ${naPercentage}% fall into the N/A category.`;

    this.correlationInterpretation = `The ${highestCorrelatedCourse} program shows the highest correlation between graduates' work and their course of study, suggesting strong alignment with industry needs. In contrast, ${highestNotCorrelatedCourse} graduates' work is predominantly classified as not correlated, indicating potential data gaps or non-traditional job roles. The overall data indicates that a majority of graduates (${notCorrelatedPercentage}%) are in jobs not related to their studies, highlighting the need for academic programs to better align with job market demands to improve career outcomes for graduates. The ${highestCorrelatedCourse} program has the highest number of graduates in correlated jobs, while the ${highestNotCorrelatedCourse} program has the lowest.`;

    // Determine the number of employed, unemployed, and seeking employment by gender
    const maleEmployed = this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 'e').length;
    const maleUnemployed = this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 'u').length;
    const maleSeeking = this.filteredStudents.filter(student => student.sex === 'Male' && student.work_Status[0].toLowerCase() === 's').length;

    const femaleEmployed = this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 'e').length;
    const femaleUnemployed = this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 'u').length;
    const femaleSeeking = this.filteredStudents.filter(student => student.sex === 'Female' && student.work_Status[0].toLowerCase() === 's').length;
    
    const maleCount = this.filteredStudents.filter(student => student.sex === 'Male').length;
    const femaleCount = this.filteredStudents.filter(student => student.sex === 'Female').length;
    const moreRepresentedGender = maleCount > femaleCount ? 'Male' : 'Female';

    // Calculate the probability of employment for males and females
    const maleEmploymentProbability = ((maleEmployed / maleCount) * 100).toFixed(1);
    const femaleEmploymentProbability = ((femaleEmployed / femaleCount) * 100).toFixed(1);
    const higherEmploymentSuccessGender = parseFloat(maleEmploymentProbability) > parseFloat(femaleEmploymentProbability) ? 'Male' : 'Female';
    const overallEmploymentRate = ((totalEmployed / totalStudents) * 100).toFixed(1);

    this.employmentrate =  `${overallEmploymentRate}%`

    this.employmentgenderStatistics = `Among males, there are ${maleEmployed} units represented as employed, ${maleUnemployed} units as unemployed, and ${maleSeeking} units that are seeking employment. Females, on the other hand, have ${femaleEmployed} units in the employed category, ${femaleUnemployed} units in the unemployed category, and ${femaleSeeking} units in the seeking employment category. In the pie chart, we can see that the representation of males in this data set is ${((this.maleCount / (this.maleCount + this.femaleCount)) * 100).toFixed(1)}%, while females make up ${((this.femaleCount / (this.maleCount + this.femaleCount)) * 100).toFixed(1)}%.`;

    this.employmentgenderenterpretation = `Males have ${maleCount}% pupulation count, and Females have ${femaleCount}%. The data suggests that ${moreRepresentedGender} is more present in this field of study. Males have ${maleEmploymentProbability}% pupulation count, and Females have ${femaleEmploymentProbability}%. This  indicate that ${higherEmploymentSuccessGender} have a higher employment rate, better job placement, or perhaps that the sample includes industries or sectors where ${higherEmploymentSuccessGender} employment is more common. some criteria to take note of: it might reflect a timing issue (for instance, if the data was collected shortly after a graduation period), or it could indicate a gender disparity in job opportunities or job-seeking success. It's also possible that the sample size or the scope of the data is limited, and therefore, it does not provide a comprehensive view of the overall gender distribution in employment. More information would be needed to understand the context of these figures and to determine if these patterns hold true across a larger population or over time.`;
  }
}

