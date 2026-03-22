import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  constructor(private http: HttpClient) { }
  
  // getConfigs(): Observable<any> {
  //   return this.http.get('/api/consultation-configs');
  // }
}
