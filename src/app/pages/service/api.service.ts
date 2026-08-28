import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private formatUrl(url: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = url.startsWith('/') ? url.slice(1) : url;
    return `${base}/${path}`;
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.formatUrl(url));
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(this.formatUrl(url), body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.formatUrl(url), body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.formatUrl(url));
  }
}
