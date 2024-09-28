import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent implements OnInit {

  modalDisplay: string = 'none'; // Controls the display of the modal

  constructor() { }

  ngOnInit(): void {
    this.openModal(); // Automatically open the modal when the component loads
  }

  openModal(): void {
    this.modalDisplay = 'block'; // Set modal display to 'block' to show it
  }

  closeModal(): void {
    this.modalDisplay = 'none'; // Set modal display to 'none' to hide it
  }

}
