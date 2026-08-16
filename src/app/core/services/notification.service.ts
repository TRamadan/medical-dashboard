import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../pages/auth/services/auth.service';
import { NotificationDTO, PaginatedNotificationsResponse } from './notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);

    private readonly baseUrl = 'https://portalapi.thesportsdoctorlab.com/api/Notifications';
    private readonly hubUrl = 'https://portalapi.thesportsdoctorlab.com/hubs/notifications';

    private hubConnection: signalR.HubConnection | null = null;

    readonly unreadCount = signal<number>(0);
    readonly notifications = signal<NotificationDTO[]>([]);
    readonly loading = signal<boolean>(false);
    readonly isConnected = signal<boolean>(false);

    /**
     * Request browser Notification permission for background desktop alerts
     */
    requestBrowserNotificationPermission(): void {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('[NotificationService] Browser notification permission:', permission);
            });
        }
    }

    /**
     * Display native OS / Desktop browser notification when tab is inactive
     */
    private showBrowserDesktopNotification(notification: NotificationDTO): void {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const title = notification.titleEn || notification.titleAr || 'New Notification';
            const body = notification.messageEn || notification.messageAr || '';

            const desktopNotif = new Notification(title, {
                body: body,
                tag: `notif-${notification.id}`,
                renotify: true
            } as NotificationOptions);

            desktopNotif.onclick = () => {
                window.focus();
                desktopNotif.close();

                if (!notification.isRead) {
                    this.markAsRead(notification.id).subscribe();
                }

                if (notification.relatedEntityType === 'Appointment' && notification.relatedEntityId) {
                    this.router.navigate(['/uikit/appointment-consultation-form', notification.relatedEntityId]);
                } else if (notification.relatedEntityType === 'TreatmentPlan' && notification.relatedEntityId) {
                    this.router.navigate(['/uikit/phases-sessions']);
                } else {
                    this.router.navigate(['/uikit/notifications-alerts']);
                }
            };
        }
    }

    /**
     * Get the logged in User ID from local storage userData
     */
    getUserId(): number | null {
        try {
            const rawData = localStorage.getItem('userData');
            if (!rawData) return null;
            const userData = JSON.parse(rawData);
            return userData.id ?? userData.userId ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Establishes SignalR connection and joins the user's notification group
     */
    async connectSignalR(): Promise<void> {
        this.requestBrowserNotificationPermission();

        const token = this.authService.getToken();
        const userId = this.getUserId();

        if (!token || !userId) {
            console.warn('[NotificationService] Missing token or userId, skipping SignalR connection.');
            return;
        }

        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            this.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.hubUrl, {
                    accessTokenFactory: () => this.authService.getToken() ?? ''
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();

            // Subscribe to real-time notification event
            this.hubConnection.on('ReceiveNotification', (notification: NotificationDTO) => {
                this.handleIncomingNotification(notification);
            });

            // Re-join user group after automatic reconnection
            this.hubConnection.onreconnected(async () => {
                const currentUserId = this.getUserId();
                if (currentUserId && this.hubConnection) {
                    await this.hubConnection.invoke('JoinUserGroup', currentUserId.toString());
                    this.isConnected.set(true);
                }
            });

            this.hubConnection.onclose(() => {
                this.isConnected.set(false);
            });

            await this.hubConnection.start();
            await this.hubConnection.invoke('JoinUserGroup', userId.toString());
            this.isConnected.set(true);
            console.log(`[SignalR] Connected & joined user_${userId}`);
        } catch (err) {
            console.error('[SignalR] Connection error:', err);
            this.isConnected.set(false);
        }
    }

    /**
     * Disconnects from SignalR hub
     */
    async disconnectSignalR(): Promise<void> {
        if (!this.hubConnection) return;
        const userId = this.getUserId();
        try {
            if (userId && this.hubConnection.state === signalR.HubConnectionState.Connected) {
                await this.hubConnection.invoke('LeaveUserGroup', userId.toString());
            }
            await this.hubConnection.stop();
        } catch (err) {
            console.error('[SignalR] Disconnect error:', err);
        } finally {
            this.hubConnection = null;
            this.isConnected.set(false);
        }
    }

    /**
     * Prepend incoming real-time notification, show Toast alert & native Desktop notification
     */
    private handleIncomingNotification(notification: NotificationDTO): void {
        this.notifications.update(current => [notification, ...current]);
        this.unreadCount.update(c => c + 1);

        // In-app Toast alert
        this.messageService.add({
            severity: 'info',
            summary: notification.titleAr || notification.titleEn,
            detail: notification.messageAr || notification.messageEn,
            life: 5000
        });

        // Desktop OS notification (visible even if the app tab is inactive or minimized)
        this.showBrowserDesktopNotification(notification);
    }

    /**
     * REST: Fetch unread count for badge
     */
    loadUnreadCount(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/unread/count`).pipe(
            tap(count => this.unreadCount.set(count)),
            catchError(() => of(0))
        );
    }

    /**
     * REST: Fetch unread notifications
     */
    loadUnreadNotifications(): Observable<NotificationDTO[]> {
        this.loading.set(true);
        return this.http.get<NotificationDTO[] | PaginatedNotificationsResponse>(`${this.baseUrl}/unread`).pipe(
            tap(res => {
                const items = Array.isArray(res) ? res : ((res as any)?.items ?? []);
                this.notifications.set(items);
                this.unreadCount.set(items.length);
                this.loading.set(false);
            }),
            map(res => Array.isArray(res) ? res : ((res as any)?.items ?? [])),
            catchError(() => {
                this.loading.set(false);
                return of([]);
            })
        );
    }

    /**
     * REST: Fetch paginated notifications history
     */
    loadNotificationsHistory(page = 1, pageSize = 50): Observable<NotificationDTO[]> {
        this.loading.set(true);
        return this.http.get<NotificationDTO[] | PaginatedNotificationsResponse>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`).pipe(
            tap(res => {
                const items = Array.isArray(res) ? res : ((res as any)?.items ?? []);
                this.notifications.set(items);
                this.loading.set(false);
            }),
            map(res => Array.isArray(res) ? res : ((res as any)?.items ?? [])),
            catchError(() => {
                this.loading.set(false);
                return of([]);
            })
        );
    }

    /**
     * REST: Mark single notification as read
     */
    markAsRead(id: number): Observable<void> {
        // Optimistic UI update
        this.notifications.update(list =>
            list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));

        return this.http.patch<void>(`${this.baseUrl}/${id}/mark-read`, {}).pipe(
            catchError(err => {
                // Revert on error
                this.loadUnreadCount().subscribe();
                return of(undefined);
            })
        );
    }

    /**
     * REST: Mark all notifications as read
     */
    markAllAsRead(): Observable<void> {
        // Optimistic UI update
        this.notifications.update(list =>
            list.map(n => ({ ...n, isRead: true }))
        );
        this.unreadCount.set(0);

        return this.http.patch<void>(`${this.baseUrl}/mark-all-read`, {}).pipe(
            catchError(err => {
                this.loadUnreadCount().subscribe();
                return of(undefined);
            })
        );
    }
}
