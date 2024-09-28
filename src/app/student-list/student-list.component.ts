import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as Plotly from 'plotly.js-dist-min';
import emailjs from 'emailjs-com';
import { EmailJSResponseStatus } from 'emailjs-com'; // Import the correct type
import { ApiService } from 'src/app/api.service';
import * as XLSX from 'xlsx';

interface StudentData {
  id: string;  // Ensure there is an 'id' field
  batchYr: string;
  program: string;
  student_name: string;
  name: string;
  email: string;
  emailSentTime?: Date; // Added field to track when an email was sent
}

interface EmailResponse {
  status: number;
  message: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})

export class StudentListComponent implements OnInit, OnChanges {
  // Add a newStudent object to hold form data
 
 
  isResultLoaded = false;
  isUpdateFormActive = false;
  isLoading: boolean = true; // Add loading state variable

  StudentArray : any[] = [];
  students: any[] = [];
  searchSurvey: string = '';
  selectedCourse: string = 'ALL CATEGORIES';
  selectedStudent: any = {};
  showEditModal: boolean = false;
  showAddModal: boolean = false
  showConfirmModal: boolean = false; 
  newStudents: any[] = [{ student_name: '', email: '', Course: '', contact: '' }];
  graph: any;
  filteredRespondentCount: number = 0;

  programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };
  selectedBatchYr: string = 'ALL YEARS';
  isCollapsed: boolean = true; // Added property to manage collapse state

  respondedCount: number = 0;
  notRespondedCount: number = 0;

  showArchiveModal: boolean = false; // Add this property
  showArchivedDataModal: boolean = false;
  archivedStudents: any[] = [];
  selectAll: boolean = false;

  
  applyFiltersAndUpdateCharts(): void {
    this.updateResponseCounts()
    this.updateProgramCounts(); // This already calls initCharts inside it
  }
  constructor(private apiService: ApiService, private router: Router) {
    emailjs.init('dvlxI8tYN4h56KhEL'); // Initialize EmailJS with your user ID
  }

  async ngOnInit() {
    await this.fetchStudents();
    await this.getAllStudent();
    this.initCharts();
    this.updateResponseCounts();
    this.students.forEach(student => {
      const storedTime = localStorage.getItem(`emailSentTime-${student.id}`);
      if (storedTime) {
        student.emailSentTime = new Date(storedTime);
      }
    });
    this.isLoading = false; // Set loading to false after data is loaded
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchSurvey']) {
      this.applyFiltersAndUpdateCharts();
    }
  }

  updateResponseCounts() {
    const allStudentNames = this.filteredStudents.map(s => s.student_name.toLowerCase());
    const respondedStudentNames = this.filteredrespondedStudents.map(s => s.name.toLowerCase());
  
    this.respondedCount = respondedStudentNames.filter(name => allStudentNames.includes(name)).length;
    this.notRespondedCount = allStudentNames.length - this.respondedCount;
  
    // Update the bar chart with the new data
    this.updateBarChart();
  }
  private initCharts(): void {
    const xArray = [this.programCounts.BSCS, this.programCounts.BSIT, this.programCounts.BSEMC, this.programCounts.ACT]; // Dynamic data for bar chart
    const yArray = ["BSCS", "BSIT", "BSEMC", "ACT"];
    const data1 = [{
      values: xArray, // Use actual counts from programCounts
      labels: yArray,
      type: 'pie' as 'pie',
      hole: .4,
    }];
    
    const layout = {
      height: 350,
      width: 500,
      font: {
        size: 12
      },
      title: {
        text: "Course Distribution",
        font: {
          size: 20 // Larger font size for the title
        }
      },
      legend: {
        font: {
          size: 16
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot('pieChart1', data1, layout);
  }
  updateBarChart() {
    const barData = [{
      x: ['Responded', 'Not Responded'],
      y: [this.respondedCount, this.notRespondedCount],
      type: 'bar' as 'bar'
    }];

    const barlayout = {
      height: 350,
      width: 500,
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
      title: "Response Status"
    };

    Plotly.newPlot('barChart1', barData, barlayout);
  }
  

  async fetchStudents() {
    const response: any = await this.apiService.getAlumniList().toPromise();
    this.students = response.data;
    this.updateChartsAndCounts();
  }

  updateChartsAndCounts() {
    this.updateResponseCounts();
    this.updateProgramCounts();
    this.initCharts();
  }

  sendEmail(student: StudentData) {
    const templateParams = {
      to_email: student.email,
      subject: 'Invitation to Participate',
      message: `Dear ${student.student_name},\n\nWe invite you to participate in our Alumni Tracer Study. Your insights are crucial for improving our programs. Your insights and experiences are crucial in helping us improve our programs and services for current and future students.`
    };

    emailjs.send('service_ztb5vrq', 'template_xobxdxc', templateParams)
      .then((response: EmailJSResponseStatus) => {
        console.log('Email successfully sent!', response);
        // alert('Email successfully sent!');
        const currentTime = new Date();
        student.emailSentTime = currentTime; // Set the current time as the email sent time
        localStorage.setItem(`emailSentTime-${student.id}`, currentTime.toString()); // Store the time in local storage
      }, (error: any) => {
        console.error('Failed to send email.', error);
        alert('Failed to send email. Please try again.');
      });
  }

 importfile(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = <any[][]>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      this.newStudents = data.slice(1).map(row => ({
        student_name: row[2],
        email: row[3],
        Course: row[1],
        contact: row[4]
      }));
    };
    reader.readAsBinaryString(target.files[0]);
  }

  sendEmailtoAll() {
    this.showConfirmModal = true; // Show the confirmation modal
  }

  confirmSendEmailtoAll() {
    this.showConfirmModal = false; // Hide the confirmation modal
    const filteredStudents = this.filteredStudents;
    filteredStudents.forEach(student => {
      console.log(`Sending email to: ${student.email}`); // Log to check if the function is looping correctly
      this.sendEmail(student);
    });
  }

  async getAllStudent() { 
    const resultData: any = await this.apiService.getSurveyAnswers().toPromise();
    this.isResultLoaded = true;
    this.StudentArray = resultData.data.map(({ id, batchYr, program, name, email }: StudentData) => ({
      id,
      batchYr,
      program,
      name,
      email
    }));
    this.updateResponseCounts();
    this.updateProgramCounts(); // Update program counts based on the fetched data
    this.initCharts();
  }

  get filteredStudents() {
    return this.students.filter(student => 
      (this.selectedCourse === 'ALL CATEGORIES' || student.Course === this.selectedCourse) &&
      student.student_name.toLowerCase().includes(this.searchSurvey.toLowerCase())
    );
  }

  get filteredrespondedStudents() {
    const filtered = this.StudentArray.filter(student => {
      return (this.selectedCourse === 'ALL CATEGORIES' || student.program === this.selectedCourse) &&
             (this.selectedBatchYr === 'ALL YEARS' || student.batchYr === this.selectedBatchYr) && // Compare as string
             student.name.toLowerCase().split(' ').some((word: string) => 
             word.startsWith(this.searchSurvey.toLowerCase()));
    });
  
    this.filteredRespondentCount = filtered.length; // Update the count based on the filtered data
    return filtered;
  }

  editStudent(student: any) {
    this.selectedStudent = {...student};
    this.showEditModal = true;
  }

  updateStudent() {
    if (this.selectedStudent && this.selectedStudent.id) {
      this.apiService.updateAlumniList(this.selectedStudent.id, this.selectedStudent).subscribe({
        next: (response) => {
          console.log('Student updated successfully', response);
          this.showEditModal = false;
          this.fetchStudents(); // Refresh the list to show the updated data
          this.updateChartsAndCounts(); // Refresh charts
        },
        error: (error) => {
          console.error('Error updating student', error);
        }
      });
    }
  }

  deleteStudent(student: any) {
    if (confirm("Are you sure you want to delete this student?")) {
      this.apiService.deleteAlumniList(student.id).subscribe((resultData: any) => {
        console.log(resultData);
        alert("Student Deleted");
        this.fetchStudents(); // Refresh student list after deletion
        this.updateChartsAndCounts(); // Refresh charts
      }, error => {
        console.error('Error deleting student:', error);
        alert("Error deleting student. Please try again.");
      });
    }
  }

  closeModal(event: MouseEvent) {
    const modalContent = (event.target as HTMLElement).closest('.modal-content');
    if (!modalContent) {
      this.showEditModal = false;
    }
  }
  closeConfirmModal(event: MouseEvent) {
    const modalContent = (event.target as HTMLElement).closest('.modal-content');
    if (!modalContent) {
      this.showConfirmModal = false;
    }
  }
  updateProgramCounts() {
    // Reset counts
    this.programCounts = { BSCS: 0, BSIT: 0, BSEMC: 0, ACT: 0 };
  
    // Count students in each program from the currently displayed list (filtered or all)
    const studentsToCount = this.filteredStudents; 
    studentsToCount.forEach(student => {
      switch (student.Course) { // Ensure the property matches your data model
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
  // Added method to toggle the collapse state
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  addNewStudentField() {
    this.newStudents.push({ student_name: '', email: '', Course: '', contact: '' });
  }


  removeStudentField(index: number) {
    if (this.newStudents.length > 1) {
      this.newStudents.splice(index, 1);
    } else {
      alert('At least one student entry is required.');
    }
  }

   // Method to close the add modal if clicked outside the modal content
  closeAddModal(event: MouseEvent) {
    const modalContent = (event.target as HTMLElement).closest('.modal-content');
    if (!modalContent) {
      this.resetNewStudents();
      this.showAddModal = false;
    }
  }

  // Method to reset new students data
  resetNewStudents() {
    this.newStudents = [{ student_name: '', email: '', Course: '', contact: '' }];
  }

  // Method to add multiple students
  addStudents() {
    for (const student of this.newStudents) {
      if (!student.student_name || !student.email || !student.Course || !student.contact) {
        alert('Please fill in all fields before saving.');
        return;
      }
    }
  
    if (this.newStudents.length === 1) {
      // Add a single student
      this.apiService.addAlumni(this.newStudents[0]).subscribe({
        next: (response) => {
          console.log('Student added successfully', response);
          this.fetchStudents(); // Refresh the list to show the new student
          this.showAddModal = false; // Close the modal
          this.resetNewStudents(); // Reset the form
          this.updateChartsAndCounts(); // Refresh charts
        },
        error: (error) => {
          console.error('Error adding student:', error);
        }
      });
    } else {
      // Add multiple students
      console.log('Adding multiple students:', this.newStudents); // Log the data being sent
      this.apiService.addMultipleAlumni(this.newStudents).subscribe({
        next: (response) => {
          console.log('Students added successfully', response);
          this.fetchStudents(); // Refresh the list to show the new student
          this.showAddModal = false; // Close the modal
          this.resetNewStudents(); // Reset the form
          this.updateChartsAndCounts(); // Refresh charts
        },
        error: (error) => {
          console.error('Error adding multiple students:', error);
        }
      });
    }
  }
  
  // Method to get the status of a student
  getStatus(student: any): string {
    const respondent = this.StudentArray.find(respondent => 
      respondent.name.toLowerCase() === student.student_name.toLowerCase() &&
      respondent.email.toLowerCase() === student.email.toLowerCase()
    );
    return respondent ? 'Responded' : 'Pending';
  }

  // New method to archive data
  archiveData() {
    this.showArchiveModal = true; // Show the archive modal
  }

  confirmArchive() {
    const selectedStudents = this.filteredStudents.filter(student => student.selected);
    
    if (selectedStudents.length === 0) {
      alert('No students selected. Please select at least one student to archive.');
      return;
    }

    // Proceed with the API call to archive the selected students
    this.apiService.archiveStudents(selectedStudents).subscribe({
      next: async (response) => {
        console.log('Students archived successfully', response);
        alert('Students archived successfully');
        this.archivedStudents.push(...selectedStudents); // Add to archived list
        
        // Wait for all delete operations to complete
        await this.deleteArchivedStudents(selectedStudents);
        
        this.fetchStudents(); // Refresh the list to show the updated data
        this.updateChartsAndCounts(); // Refresh charts
        this.showArchiveModal = false; // Close the modal

        // Download the archived data as an Excel file
        this.downloadArchivedData();
      },
      error: (error) => {
        console.error('Error archiving students:', error);
        alert('Error archiving students. Please try again.');
      }
    });
  }

  async deleteArchivedStudents(students: any[]) {
    const deletePromises = students.map(student => 
      this.apiService.deleteAlumniList(student.id).toPromise()
    );
    
    try {
      await Promise.all(deletePromises);
      console.log('All selected students deleted successfully');
    } catch (error) {
      console.error('Error deleting some students:', error);
    }
  }

  // Method to restore archived students
  restoreArchived() {
    const selectedArchivedStudents = this.archivedStudents.filter(student => student.selected);
    
    if (selectedArchivedStudents.length === 0) {
      alert('No students selected. Please select at least one student to restore.');
      return;
    }

    // Proceed with the API call to restore the selected students
    this.apiService.restoreStudents(selectedArchivedStudents).subscribe({
      next: (response) => {
        console.log('Students restored successfully', response);
        alert('Students restored successfully');
        this.students.push(...selectedArchivedStudents); // Add back to main list
        this.archivedStudents = this.archivedStudents.filter(student => !student.selected); // Remove from archived list
        this.fetchStudents(); // Refresh the list to show the updated data
        this.updateChartsAndCounts(); // Refresh charts
        this.showArchivedDataModal = false; // Close the modal
      },
      error: (error) => {
        console.error('Error restoring students:', error);
        alert('Error restoring students. Please try again.');
      }
    });
  }

  // Method to close the archived data modal
  closeArchivedDataModal(event: MouseEvent) {
    const modalContent = (event.target as HTMLElement).closest('.modal-content');
    if (!modalContent) {
      this.showArchivedDataModal = false;
    }
  }

  // Method to open the archived data modal
  openArchivedDataModal() {
    this.showArchivedDataModal = true;
  }

  closeArchiveModal(event: MouseEvent) {
    const modalContent = (event.target as HTMLElement).closest('.modal-content');
    if (!modalContent) {
      this.showArchiveModal = false;
    }
  }

  toggleSelectAll() {
    this.filteredStudents.forEach(student => student.selected = this.selectAll);
  }

  // New method to download archived data as an Excel file
  downloadArchivedData() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.archivedStudents);
    const workbook: XLSX.WorkBook = { Sheets: { 'Archived Students': worksheet }, SheetNames: ['Archived Students'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Archived_Students');
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