import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { StudentService } from 'src/app/student.service';

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css']
})
export class EditStudentComponent implements OnInit {
  student: any = null; // Initialize as null
  studentId: string | null = null; // Add this line to store the student ID

  constructor(private route: ActivatedRoute, private apiService: ApiService, private router: Router, private studentService: StudentService) { }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id'); // Retrieve the student ID from the route
    if (this.studentId) {
      this.apiService.getStudentById(this.studentId).subscribe((data: any) => {
        console.log(data); // Log the data to see its structure
        if (data && data.data) {
          this.student = data.data; // Directly assign the data to student
        } else {
          console.error('Expected an object but got:', data.data);
        }
      }, error => {
        console.error('Error fetching student data:', error);
      });
    } else {
      console.error('Student ID is null');
      // Handle the null case appropriately, e.g., navigate away or show an error message
    }
  }

  updateStudent() {
    this.apiService.updateSurveyAnswer(this.student.id, this.student).subscribe((resultData: any) => {
      alert("Student Updated Successfully");
      this.router.navigate(['/respondent-data']);
    }, error => {
      console.error('Error updating student:', error);
      alert("Error updating student. Please try again.");
    });
  }

  cancelEdit() {
    this.router.navigate(['/respondent-data']); // Navigate to the desired route on cancel
  }
}