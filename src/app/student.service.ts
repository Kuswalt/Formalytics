import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private studentIds: string[] = [];
  private studentId: string | null = null;
  setStudentIds(ids: string[]) {
    this.studentIds = ids;
  }
  setStudentId(id: string) {
    this.studentId = id;
  }
  getStudentIds(): string[] {
    return this.studentIds;
  }

  getStudentId(): string | null {
    return this.studentId;
  }
}