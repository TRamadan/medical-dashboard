import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { QuestionnaireGetDTO, QuestionnaireAnswers, QuestionnaireSubmitResponse } from '../models/questionair.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireServiceService {

  // Public endpoints — token travels in the query string, no Authorization header.
  private readonly baseUrl = `${environment.questionnaireUrl}Questionnaire`;

  constructor(private http: HttpClient) { }

  /**
   * GET /api/Questionnaire?token=<TOKEN>
   * 400 -> token missing / link expired
   * 404 -> token not found
   */
  getQuestionnaire(token: string): Observable<QuestionnaireGetDTO> {
    const params = new HttpParams().set('token', token);
    return this.http
      .get<QuestionnaireGetDTO>(this.baseUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST /api/Questionnaire?token=<TOKEN>
   * Re-submitting overwrites any previous answers.
   */
  submitQuestionnaire(
    token: string,
    answers: QuestionnaireAnswers
  ): Observable<QuestionnaireSubmitResponse> {
    const params = new HttpParams().set('token', token);
    return this.http
      .post<QuestionnaireSubmitResponse>(this.baseUrl, answers, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'حدث خطأ غير متوقع. حاول مرة أخرى.';
    if (error.status === 400) {
      message = 'الرابط غير صالح أو منتهي الصلاحية.';
    } else if (error.status === 404) {
      message = 'لم يتم العثور على هذا الرابط.';
    }
    return throwError(() => ({ ...error, friendlyMessage: message }));
  }
}
