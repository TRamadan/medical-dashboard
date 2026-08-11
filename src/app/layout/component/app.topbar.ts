import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDTO } from '../../core/services/notification.model';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, BadgeModule, ButtonModule, AppConfigurator],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <span>App title will be here</span>
            </a>
        </div>

        <div class="layout-topbar-actions">

            <!-- Real-Time Notifications Overlay -->
            <div class="relative">
                <button
                    type="button"
                    class="layout-topbar-action p-overlay-badge relative"
                    (click)="toggleNotificationsPanel()"
                    pTooltip="Notifications"
                >
                    <i class="pi pi-bell"></i>
                    @if (notificationService.unreadCount() > 0) {
                        <p-badge
                            [value]="notificationService.unreadCount()"
                            severity="danger"
                            size="small"
                            styleClass="absolute -top-1 -right-1"
                        ></p-badge>
                    }
                </button>

                @if (showOverlay()) {
                    <div
                        class="absolute right-0 top-12 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                        <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-bell text-primary"></i>
                                <span class="font-bold text-sm text-gray-800 dark:text-gray-100">Notifications</span>
                                @if (notificationService.unreadCount() > 0) {
                                    <span class="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                                        {{ notificationService.unreadCount() }} new
                                    </span>
                                }
                            </div>
                            @if (notificationService.unreadCount() > 0) {
                                <button
                                    type="button"
                                    class="text-xs text-primary font-medium hover:underline p-0 bg-transparent border-none cursor-pointer"
                                    (click)="markAllAsRead()"
                                >
                                    Mark all read
                                </button>
                            }
                        </div>

                        <div class="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                            @if (notificationService.loading()) {
                                <div class="p-4 text-center text-sm text-gray-400">Loading notifications...</div>
                            } @else if (notificationService.notifications().length === 0) {
                                <div class="p-6 text-center text-gray-400">
                                    <i class="pi pi-inbox text-3xl mb-2 block"></i>
                                    <p class="text-sm m-0">No notifications</p>
                                </div>
                            } @else {
                                @for (n of notificationService.notifications(); track n.id) {
                                    <div
                                        class="p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 flex gap-3 items-start"
                                        [ngClass]="{ 'bg-blue-50/50 dark:bg-blue-900/10': !n.isRead }"
                                        (click)="onNotificationTap(n)"
                                    >
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                                            <i [class]="getNotificationIcon(n.relatedEntityType)"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center justify-between gap-1 mb-1">
                                                <h4 class="text-xs font-semibold m-0 text-gray-900 dark:text-gray-100 truncate">
                                                    {{ n.titleEn || n.titleAr }}
                                                </h4>
                                                @if (!n.isRead) {
                                                    <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                }
                                            </div>
                                            <p class="text-xs text-gray-600 dark:text-gray-300 m-0 line-clamp-2 leading-relaxed">
                                                {{ n.messageEn || n.messageAr }}
                                            </p>
                                            <span class="text-[10px] text-gray-400 block mt-1">
                                                {{ formatTime(n.createdAt) }}
                                            </span>
                                        </div>
                                    </div>
                                }
                            }
                        </div>
                    </div>
                }
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="logOut()">
                        <i class="pi pi-sign-out"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `
})
export class AppTopbar implements OnInit, OnDestroy {
    public readonly router = inject(Router);
    public readonly layoutService = inject(LayoutService);
    public readonly notificationService = inject(NotificationService);

    items!: MenuItem[];
    showOverlay = signal<boolean>(false);

    ngOnInit(): void {
        this.notificationService.loadUnreadCount().subscribe();
        this.notificationService.connectSignalR();
    }

    ngOnDestroy(): void {
        this.notificationService.disconnectSignalR();
    }

    toggleNotificationsPanel(): void {
        const nextState = !this.showOverlay();
        this.showOverlay.set(nextState);
        if (nextState) {
            this.notificationService.loadUnreadNotifications().subscribe();
        }
    }

    markAllAsRead(): void {
        this.notificationService.markAllAsRead().subscribe();
    }

    onNotificationTap(notification: NotificationDTO): void {
        if (!notification.isRead) {
            this.notificationService.markAsRead(notification.id).subscribe();
        }
        this.showOverlay.set(false);

        if (notification.relatedEntityType === 'Appointment' && notification.relatedEntityId) {
            this.router.navigate(['/uikit/appointment-consultation-form', notification.relatedEntityId]);
        } else if (notification.relatedEntityType === 'TreatmentPlan' && notification.relatedEntityId) {
            this.router.navigate(['/uikit/phases-sessions']);
        } else {
            this.router.navigate(['/uikit/notifications-alerts']);
        }
    }

    getNotificationIcon(entityType: string | null): string {
        switch (entityType) {
            case 'Appointment':
                return 'pi pi-calendar';
            case 'TreatmentPlan':
                return 'pi pi-file-edit';
            default:
                return 'pi pi-info-circle';
        }
    }

    formatTime(isoString: string): string {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logOut(): void {
        this.notificationService.disconnectSignalR();
        localStorage.clear();
        this.router.navigate(['/auth/login']);
    }
}
