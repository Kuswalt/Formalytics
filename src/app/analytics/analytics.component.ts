import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Plotly from 'plotly.js-dist-min';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ApiService } from '../api.service';

interface StudentData {
  id: string;  // Ensure there is an 'id' field
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
  
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  constructor(private apiService: ApiService) {}

  
  StudentArray : any[] = [];
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
  work_place: string ='';
  
  currentStudentID = "";
  searchText: string = '';
  searchSurvey: string = ''; 
  selectedCourse: string = 'ALL CATEGORIES'; 
  selectedBatchYr: string = 'ALL YEARS';
  selectedSex: string = 'ALL SEXES';
  selectedWorkStatus: string = 'ALL STATUSES';
  loadingCharts: boolean = false;

  students: any[] = [];  // Initialize the students property with an empty array

  programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };
  isCollapsed: boolean = true; 
  applyFiltersAndUpdateCharts(): void {
    this.updateEmploymentCounts(this.filteredStudents);
    this.updateProgramCounts(); // This already calls initCharts inside it
  }
  ngOnInit() {
    this.initCharts();
    this.getAllStudent();
  }
  getAllStudent() {
    this.apiService.getSurveyAnswers().subscribe((resultData: any) => {
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
      this.initCharts();
    });
  }

  updateProgramCounts() {
    // Reset counts
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
    this.initCharts();
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
             (this.selectedBatchYr === 'ALL YEARS' || student.batchYr.toString() === this.selectedBatchYr.toString()) && // Compare as string
             (this.selectedSex === 'ALL SEXES' || student.sex === this.selectedSex) &&
             (this.selectedWorkStatus === 'ALL STATUSES' || student.work_Status === this.selectedWorkStatus);
    });
    return filtered;
  }
  
private initCharts(): void {
  const data1 = [{
    values: [this.employedCount, this.unemployedCount, this.seekingEmploymentCount], // Example values
    labels: ['Unemployed', 'Employed','Seeking employment'], // Example labels
    type: 'pie' as 'pie',
    pull: [0.1, 0.1, 0.1]
  }];

  let maleCount = 0;
  let femaleCount = 0;
  this.filteredStudents.forEach(student => {
    if (student.sex === 'Male') maleCount++;
    if (student.sex === 'Female') femaleCount++;
  });

  const data2 = [{
    values: [maleCount, femaleCount], // Example values
    labels: ['Male', 'Female'], // Example labels
    type: 'pie' as 'pie',
    hole: .3,
    pull: [0.01, 0.01]
  }];
  let abroadCount = 0;
  let localCount = 0;
  let naCount = 0;
  this.filteredStudents.forEach(student => {
    switch (student.work_place) {
      case 'Abroad':
        abroadCount++;
        break;
      case 'Local':
        localCount++;
        break;
      default:
        naCount++;
        break;
    }
  });
  const data3 = [{
    values: [abroadCount, localCount, naCount], // Example values
    labels: ['Abroad', 'Local', 'n/a'], // Example labels
    type: 'pie' as 'pie',
    hole: .4,
    pull: [0.03, 0.01, 0.09]
  }];

  let singleCount = 0, marriedCount = 0, in_a_RelationshipCount = 0, widowedCount = 0, widowerCount = 0, separatedCount = 0;
  this.filteredStudents.forEach(student => {
    switch (student.civil_Status) {
      case 'Single':
        singleCount++;
        break;
      case 'Married':
        marriedCount++;
        break;
      case 'In a Relationship':
        in_a_RelationshipCount++;
        break;
      case 'Widowed':
        widowedCount++;
        break;
      case 'Widower':
        widowerCount++;
        break;
      case 'Separated':
        separatedCount++;
        break;
    }
  });
  const data4 = [{
    values: [singleCount, marriedCount, in_a_RelationshipCount, widowedCount, widowerCount, separatedCount],
    labels: ['Single', 'Married', 'Relationship', 'Widowed', 'Widower', 'Separated'],
    type: 'pie' as 'pie',
    pull: [0.02, 0.02, 0.02, 0.1, 0.02]
  }];

  let yesCount = 0, noCount = 0, notavalableCount = 0;
  this.filteredStudents.forEach(student => {
    switch (student.firstjob_curriculum) {
      case 'Yes':
        yesCount++;
        break;
      case 'No':
        noCount++;
        break;
      case 'n/a':
        notavalableCount++;
        break;
    }
  });
  const data5 = [{
    values: [yesCount, noCount, notavalableCount],
    labels: ['Yes', 'No', 'n/a'],
    type: 'pie' as 'pie',
    hole: .6,
    pull: [0.05, 0.05, 0.05]
  }];

  let BSCSCount = 0, BSITCount = 0, BSEMCCount = 0, ACTCount = 0;
  this.filteredStudents.forEach(student => {
    switch (student.program) {
      case 'BSCS':
        BSCSCount++;
        break;
      case 'BSIT':
        BSITCount++;
        break;
      case 'BSEMC':
        BSEMCCount++;
        break;
      case 'ACT':
        ACTCount++;
        break;
    }
  });
  const data6 = [{
    values: [BSCSCount, BSITCount, BSEMCCount, ACTCount],
    labels: ['BSCS', 'BSIT', 'BSEMC', 'ACT'],
    type: 'pie' as 'pie',
    hole: .4
  }];
  const batchYearCounts = this.filteredStudents.reduce((acc, student) => {
    acc[student.batchYr] = (acc[student.batchYr] || 0) + 1;
    return acc;
  }, {});

  const barData2 = [{
    x: Object.values(batchYearCounts) as number[],
    y: Object.keys(batchYearCounts),
    type: 'bar' as 'bar',
    orientation: 'h' as 'h',
  }];
  
  

 

  
  
   // Initialize salary data structure
   const salaryData: { [key: string]: { [year: number]: { total: number, count: number } } } = {
    BSCS: {},
    BSIT: {},
    BSEMC: {},
    ACT: {}
  };

  const lineyears = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  lineyears.forEach(year => {
    salaryData['BSCS'][year] = { total: 0, count: 0 };
    salaryData['BSIT'][year] = { total: 0, count: 0 };
    salaryData['BSEMC'][year] = { total: 0, count: 0 };
    salaryData['ACT'][year] = { total: 0, count: 0 };
  });

  // Accumulate salary data
  this.filteredStudents.forEach(student => {
    const year = parseInt(student.batchYr);
    if (lineyears.includes(year)) {
      const salary = parseInt(student.salary) || 0; // Convert salary to number, default to 0 if not a number
      if (salaryData[student.program][year]) {
        salaryData[student.program][year].total += salary;
        salaryData[student.program][year].count++;
      }
    }
  });

  // Prepare line data for plotting
  const lineData = Object.keys(salaryData).map(program => {
    const yData = lineyears.map(year => {
      const data = salaryData[program][year];
      return data.count > 0 ? Math.round(data.total / data.count) : 0; // Calculate average and round it to the nearest integer
    });
  
    return {
      x: lineyears,
      y: yData,
      mode: "lines" as "lines",
      type: "scatter" as "scatter",
      name: program
    };
  });


  const yearCourseCounts: { [year: string]: { BSCS: number; BSIT: number; BSEMC: number; ACT: number } } = {};

  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  years.forEach(year => {
    yearCourseCounts[year] = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };
  });

  this.filteredStudents.forEach(student => {
    const yearKey = String(student.batchYr); // Convert to string to match key type
    if (years.includes(parseInt(yearKey)) && yearCourseCounts[yearKey]) {
      const programKey = student.program as keyof typeof yearCourseCounts[string];
      yearCourseCounts[yearKey][programKey]++;
    }
  });
  const courseColors = { ACT: 'purple', BSIT: 'blue', BSCS: 'orange', BSEMC: 'green' };
  

  const barData = Object.keys(yearCourseCounts[2019]).map(course => {
    return {
      x: years.map(year => yearCourseCounts[year][course as keyof typeof yearCourseCounts[string]]),
      y: years,
      name: course,
      type: 'bar' as 'bar',
      orientation: 'h' as 'h',
      marker: { color: courseColors[course as keyof typeof courseColors] }
    };
  });
  
  const linelayout = {
    height: 350,
    width: 750,
    yaxis: {range: [0, 100000], title: "Income Range"},
    xaxis: {range: [2019, 2026], title: "Batch Year"},
    title: "Avarage Monthly Income per Year",
    paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
    plot_bgcolor: 'rgba(0,0,0,0)',
  };
  const pielayout = {
    height: 350,
    width: 400,
    
    font: {
      size: 12 // Increase the font size
    },
    title: {
      font: {
        size: 20 // Increase the title font size
      }
    },
    legend: {
      font: {
        size: 8 // Increase the legend font size
      }
    },
    paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
    plot_bgcolor: 'rgba(0,0,0,0)',
  };
  const Hbarlayout = {
    barmode: 'group' as 'group',
    height: 400,
    width: 750,
    font: {
      size: 12
    },
    title: {
      text: 'Responses Per Year by Course',
      font: {
        size: 18
      }
    },
    legend: {
      font: {
        size: 12
      }
    },
    xaxis: {
      title: 'Number of Responses'
    },
    yaxis: {
      title: 'Batch Year'
    }
  };
  const barlayout1 = {
    height: 400,
    width: 1110,
    font: {
      size: 12 // Increase the font size
    },
    title: {
      text: 'Graduate per Year',
      font: {
        size: 24 // Increase the title font size
      }
    },
    legend: {
      font: {
        size: 12 // Increase the legend font size
      }
    }
  };
  const barlayout2 = {
    height: 400,
    width: 555,
    font: {
      size: 10 // Increase the font size
    },
    title: {
      text: 'Income Range',
      font: {
        size: 24 // Increase the title font size
      }
    },
    legend: {
      font: {
        size: 10 // Increase the legend font size
      }
    }
  };
  const smalllayout = {
    height: 390,
    width: 300,
    font: {
      size: 8 // Increase the font size
    },
    title: {
      font: {
        size: 8 // Increase the title font size
      }
    },
    legend: {
      font: {
        size: 8 // Increase the legend font size
      }
    }
  };
  const courselayout = {
    height: 350,
    width: 370,
    font: {
      size: 16 // Increase the font size
    },
    title: {
      text: 'Course Ratio',
      font: {
        size: 24 // Increase the title font size
       
      }
    },
    legend: {
      font: {
        size: 16 // Increase the legend font size
      }
    }
  };
  const correlationlayout = {
    height: 350,
    width: 370,
    font: {
      size: 16 // Increase the font size
    },
    title: {
      text: 'Job to Course Correlation',
      font: {
        size: 24 // Increase the title font size
       
      }
    },
    legend: {
      font: {
        size: 16 // Increase the legend font size
      }
    }
  };
  const civilstatlayout = {
    height: 350,
    width: 370,
    font: {
      size: 12 // Increase the font size
    },
    title: {
      text: 'Civil Status',
      font: {
        size: 24 // Increase the title font size
       
      }
    },
    legend: {
      font: {
        size: 12 // Increase the legend font size
      }
    }
  };

  
  Plotly.newPlot('pieChart1', data1, pielayout);
  Plotly.newPlot('pieChart2', data2, smalllayout);
  Plotly.newPlot('pieChart3', data3, smalllayout);
  Plotly.newPlot('pieChart4', data4, civilstatlayout)
  Plotly.newPlot('pieChart5', data5, correlationlayout)
  Plotly.newPlot('pieChart6', data6, courselayout)
  Plotly.newPlot('barChart1', barData, Hbarlayout);
  Plotly.newPlot('barChart2', barData2, barlayout1);
  // Plotly.newPlot('barChart3', barData3, barlayout2);
 
  
  Plotly.newPlot('lineChart1', lineData, linelayout);
  

}
toggleCollapse() {
  this.isCollapsed = !this.isCollapsed;
}
saveAnalysis() {
  // Capture Analysis-content1 and add it to the first page
  html2canvas(document.getElementById('Analysis-content1')!).then(canvas1 => {
    const contentDataURL1 = canvas1.toDataURL('image/png');
    let pdf = new jsPDF('l', 'cm', 'a4'); // Generates PDF in landscape mode
    pdf.addImage(contentDataURL1, 'PNG', 0, 0, 29.7, 21.0);

    // Capture Analysis-content2
    html2canvas(document.getElementById('Analysis-content2')!).then(canvas2 => {
      const contentDataURL2 = canvas2.toDataURL('image/png');
      pdf.addPage(); // Add a new page
      pdf.addImage(contentDataURL2, 'PNG', 0, 0, 29.7, 10.5); // Add image to the top half of the page

      // Capture Analysis-content3
      html2canvas(document.getElementById('Analysis-content3')!).then(canvas3 => {
        const contentDataURL3 = canvas3.toDataURL('image/png');
        pdf.addImage(contentDataURL3, 'PNG', 0, 10.5, 29.7, 10.5); // Add image to the bottom half of the page
        pdf.save('Analysis.pdf'); // Save the PDF
      });
    });
  });
}
}
