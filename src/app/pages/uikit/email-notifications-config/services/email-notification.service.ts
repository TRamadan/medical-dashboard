import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EmailPayload, NotificationPayload } from '../models/email-notification.model';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private http = inject(HttpClient);

  sendEmail(payload: EmailPayload): Observable<any> {
    // Replace with real endpoint
    console.log('Sending email:', payload);
    return of({ success: true });
  }

  sendNotification(payload: NotificationPayload): Observable<any> {
    // Replace with real endpoint
    console.log('Sending notification:', payload);
    return of({ success: true });
  }
}
