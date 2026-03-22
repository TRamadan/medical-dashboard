import { Component, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { EmailPlaceholder } from './models/email-notification.model';
import { EmailNotificationService } from './services/email-notification.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-email-notifications-config',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SelectButtonModule, 
    ButtonModule, 
    InputTextModule, 
    TextareaModule, 
    DropdownModule, 
    RippleModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './email-notifications-config.component.html',
  styleUrls: ['./email-notifications-config.component.scss']
})
export class EmailNotificationsConfigComponent {
  configMode = signal<'email' | 'notification' | 'sent-emails' | 'sent-notifications'>('email');
  modeOptions = [
    { label: 'Email Config', value: 'email', icon: 'pi pi-envelope' },
    { label: 'Notifications Config', value: 'notification', icon: 'pi pi-bell' },
    { label: 'Sent Emails', value: 'sent-emails', icon: 'pi pi-send' },
    { label: 'Sent Notifications', value: 'sent-notifications', icon: 'pi pi-history' }
  ];

  // Email state
  emailTo = signal('recipient@example.com');
  emailSubject = signal('Email subject — use {{placeholder}} for dynamic text');
  emailBody = signal('Hello {{name}},\n\nThank you for reaching out. We wanted to let you know that your request regarding {{topic}} has been received.\n\nWe\'ll get back to you by {{date}}.\n\nBest regards,\n{{sender_name}}');
  
  placeholders = signal<EmailPlaceholder[]>([
    { key: 'name', value: 'John' },
    { key: 'topic', value: 'your inquiry' },
    { key: 'date', value: 'March 25, 2026' },
    { key: 'sender_name', value: 'The Team' }
  ]);
  
  newPlaceholderName = signal('');
  @ViewChild('bodyTextarea') bodyTextarea!: ElementRef<HTMLTextAreaElement>;

  // Notification state
  notificationTitle = signal('Notification title');
  notificationMessage = signal('');
  notificationType = signal('info');
  notificationTypeOptions = [
    { label: 'Info', value: 'info', icon: 'pi pi-info-circle text-blue-500' },
    { label: 'Success', value: 'success', icon: 'pi pi-check text-green-500' },
    { label: 'Warning', value: 'warning', icon: 'pi pi-exclamation-triangle text-orange-500' },
    { label: 'Error', value: 'error', icon: 'pi pi-times-circle text-red-500' }
  ];
  selectedNotificationOption = computed(() => this.notificationTypeOptions.find(o => o.value === this.notificationType()));

  // Computed previews mapped with placeholders
  previewSubject = computed(() => this.replacePlaceholders(this.emailSubject()));
  previewBody = computed(() => this.replacePlaceholders(this.emailBody()));

  constructor(
    private emailNotificationService: EmailNotificationService,
    private messageService: MessageService
  ) {}

  addPlaceholder() {
    const name = this.newPlaceholderName().trim().replace(/[{}]/g, ''); // Ensure no brackets
    if (name && !this.placeholders().some(p => p.key === name)) {
      this.placeholders.update(p => [...p, { key: name, value: '' }]);
      this.newPlaceholderName.set('');
    }
  }

  insertPlaceholderToBody(key: string) {
    const tag = `{{${key}}}`;
    const textarea = this.bodyTextarea?.nativeElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentBody = this.emailBody();
      
      const newBody = currentBody.substring(0, start) + tag + currentBody.substring(end);
      this.emailBody.set(newBody);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        textarea.focus();
      });
    } else {
      this.emailBody.update(body => body + (body.endsWith(' ') || body === '' ? '' : ' ') + tag);
    }
  }

  removePlaceholder(key: string) {
    this.placeholders.update(p => p.filter(item => item.key !== key));
  }

  updatePlaceholderValue(key: string, value: string) {
    this.placeholders.update(p => {
      const copy = [...p];
      const index = copy.findIndex(item => item.key === key);
      if (index !== -1) copy[index].value = value;
      return copy;
    });
  }

  private replacePlaceholders(text: string): string {
    if (!text) return '';
    let result = text;
    this.placeholders().forEach(p => {
      const val = p.value || `{{${p.key}}}`;
      result = result.split(`{{${p.key}}}`).join(val);
    });
    return result;
  }

  sendEmail() {
    this.emailNotificationService.sendEmail({
      to: this.emailTo(),
      subject: this.previewSubject(),
      body: this.previewBody()
    }).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email Sent Successfully' });
    });
  }

  sendNotification() {
    this.emailNotificationService.sendNotification({
      title: this.notificationTitle(),
      message: this.notificationMessage(),
      type: this.notificationType()
    }).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification Sent Successfully' });
    });
  }
}
