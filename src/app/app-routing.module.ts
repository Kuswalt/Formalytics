import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';  // Import AuthGuard

import { ThankYouComponent } from './thank-you/thank-you.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './users/login/login.component';
import { CreateuserComponent } from './users/login/createuser/createuser.component';
import { SurveyComponent } from './mainpage/survey/survey.component';
import { ResponsesurveyComponent } from './responsesurvey/responsesurvey.component';
import { RespondentDataComponent } from './respondent-data/respondent-data.component';
import { EditStudentComponent } from './edit-student/edit-student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { StudentListComponent } from './student-list/student-list.component';

const routes: Routes = [
  { path: '', component: MainpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'register', component: CreateuserComponent },
  { path: 'survey', component: SurveyComponent, canActivate: [AuthGuard] },
  { path: 'responsesurvey/:id', component: ResponsesurveyComponent},
  { path: 'respondent-data', component: RespondentDataComponent, canActivate: [AuthGuard] },
  { path: 'edit-student/:id', component: EditStudentComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'student-list', component: StudentListComponent, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }