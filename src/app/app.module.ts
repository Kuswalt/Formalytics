import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { LoginComponent } from './users/login/login.component';
import { CreateuserComponent } from './users/login/createuser/createuser.component';
import { LoginService } from './users/login/login.service';
import { CreateuserService } from './users/login/createuser/createuser.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SurveyComponent } from './mainpage/survey/survey.component';

import { ResponsesurveyComponent } from './responsesurvey/responsesurvey.component';
import { RespondentDataComponent } from './respondent-data/respondent-data.component';
import { UserService } from './services/user.service';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { StudentListComponent } from './student-list/student-list.component';
import { AuthGuard } from './auth/auth.guard';
import { EditStudentComponent } from './edit-student/edit-student.component'; 


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateuserComponent,
    HeaderComponent,
    FooterComponent,
    MainpageComponent,
    SurveyComponent,
    ResponsesurveyComponent,
    RespondentDataComponent,
    ThankYouComponent,
    DashboardComponent,
    AnalyticsComponent,
    StudentListComponent,
    EditStudentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: MainpageComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: CreateuserComponent }, 
      { path: 'survey', component: SurveyComponent, canActivate: [AuthGuard] },
      { path: 'responsesurvey', component: ResponsesurveyComponent},
      { path: 'respondent-data', component: RespondentDataComponent, canActivate: [AuthGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
      { path: 'student-list', component: StudentListComponent, canActivate: [AuthGuard] }
    ]),
    NgChartsModule
  ],
  providers: [LoginService, CreateuserService, UserService, AuthGuard], // Add AuthGuard to providers
  bootstrap: [AppComponent]
})
export class AppModule { }
