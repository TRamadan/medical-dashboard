import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AudienceOption,
  AudienceUserItem,
  NotificationTriggerDetail,
  NotificationTriggerListItem,
  NotificationTriggerListResponse,
  NotificationTriggerPayload,
  NotificationTriggerTypeOption,
} from '../models/notification-trigger.model';

@Injectable({ providedIn: 'root' })
export class NotificationTriggerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl}/NotificationTriggers`;

  private readonly _triggers = signal<NotificationTriggerListItem[]>([]);
  private readonly _activeCount = signal<number>(0);
  private readonly _totalCount = signal<number>(0);
  private readonly _triggerTypes = signal<NotificationTriggerTypeOption[]>([]);
  private readonly _audienceOptions = signal<AudienceOption[]>([]);
  private readonly _audienceUsers = signal<AudienceUserItem[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly triggers = this._triggers.asReadonly();
  readonly activeCount = computed(() => this._activeCount());
  readonly totalCount = computed(() => this._totalCount());
  readonly triggerTypes = this._triggerTypes.asReadonly();
  readonly audienceOptions = this._audienceOptions.asReadonly();
  readonly audienceUsers = this._audienceUsers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** GET /api/NotificationTriggers */
  loadTriggers(): Observable<NotificationTriggerListResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<NotificationTriggerListResponse>(this.baseUrl).pipe(
      tap((res) => {
        const list = res?.triggers ?? [];
        this._triggers.set(list);
        this._activeCount.set(res?.activeCount ?? list.filter((t) => t.isActive).length);
        this._totalCount.set(res?.totalCount ?? list.length);
        this._loading.set(false);
      }),
      catchError((err) => {
        this._loading.set(false);
        this._error.set('Failed to load notification triggers.');
        return of({ activeCount: 0, totalCount: 0, triggers: [] });
      })
    );
  }

  /** GET /api/NotificationTriggers/types */
  loadTypes(): Observable<NotificationTriggerTypeOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/types`).pipe(
      map((res) =>
        (res || []).map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return {
              id: item.id ?? item.value ?? index + 1,
              name: item.name ?? item.label ?? item.title ?? `Category ${item.id ?? index + 1}`,
              label: item.label ?? item.name,
            };
          }
          return { id: index + 1, name: String(item) };
        })
      ),
      tap((types) => this._triggerTypes.set(types)),
      catchError(() => of([]))
    );
  }

  /** GET /api/NotificationTriggers/audience-options */
  loadAudienceOptions(): Observable<AudienceOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}/audience-options`).pipe(
      map((res) =>
        (res || []).map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return {
              id: item.id ?? item.value ?? index + 1,
              name: item.name ?? item.label ?? `Role ${item.id ?? index + 1}`,
            };
          }
          return { id: index + 1, name: String(item) };
        })
      ),
      tap((options) => this._audienceOptions.set(options)),
      catchError(() => of([]))
    );
  }

  /** GET /api/NotificationTriggers/users?employeeTypeId=&patients=&search= */
  loadUsers(employeeTypeId?: number, patients?: boolean, search?: string): Observable<AudienceUserItem[]> {
    let params = new HttpParams();
    if (employeeTypeId != null) params = params.set('employeeTypeId', employeeTypeId.toString());
    if (patients != null) params = params.set('patients', patients.toString());
    if (search) params = params.set('search', search);

    return this.http.get<AudienceUserItem[]>(`${this.baseUrl}/users`, { params }).pipe(
      tap((users) => this._audienceUsers.set(users || [])),
      catchError(() => of([]))
    );
  }

  /** GET /api/NotificationTriggers/{id} */
  getTriggerById(id: number | string): Observable<NotificationTriggerDetail> {
    return this.http.get<NotificationTriggerDetail>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/NotificationTriggers */
  createTrigger(payload: NotificationTriggerPayload): Observable<NotificationTriggerDetail> {
    return this.http.post<NotificationTriggerDetail>(this.baseUrl, payload).pipe(
      tap(() => this.loadTriggers().subscribe())
    );
  }

  /** PUT /api/NotificationTriggers/{id} */
  updateTrigger(id: number | string, payload: NotificationTriggerPayload): Observable<NotificationTriggerDetail> {
    return this.http.put<NotificationTriggerDetail>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => this.loadTriggers().subscribe())
    );
  }

  /** PATCH /api/NotificationTriggers/{id}/toggle */
  toggleActive(id: number | string): Observable<void> {
    // Optimistic UI update
    this._triggers.update((list) =>
      list.map((t) => {
        if (t.id === Number(id) || t.id === id) {
          const newActive = !t.isActive;
          this._activeCount.update((c) => (newActive ? c + 1 : Math.max(0, c - 1)));
          return { ...t, isActive: newActive };
        }
        return t;
      })
    );

    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, {}).pipe(
      catchError(() => {
        // Revert on error
        this.loadTriggers().subscribe();
        return of(undefined);
      })
    );
  }

  /** DELETE /api/NotificationTriggers/{id} */
  deleteTrigger(id: number | string): Observable<void> {
    this._triggers.update((list) => list.filter((t) => t.id !== Number(id) && t.id !== id));
    this._totalCount.update((c) => Math.max(0, c - 1));

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.loadTriggers().subscribe()),
      catchError(() => {
        this.loadTriggers().subscribe();
        return of(undefined);
      })
    );
  }
}

