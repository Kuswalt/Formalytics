import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespondentDataComponent } from './respondent-data.component';

describe('RespondentDataComponent', () => {
  let component: RespondentDataComponent;
  let fixture: ComponentFixture<RespondentDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespondentDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespondentDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
