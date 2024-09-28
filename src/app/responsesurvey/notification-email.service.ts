import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationEmailService {

  constructor(private apiService: ApiService) { }

  sendEmail(subject: string, body: string, to: string): Promise<void> {
    return this.apiService.sendEmail(subject, body, to);
  }

  sendNotification(title: string, body: string): void {
    // Here you can implement your notification logic, such as using browser's native notifications
    // This example sends a browser notification
    if (!("Notification" in window)) {
      alert('This browser does not support desktop notification');
    } else if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
}