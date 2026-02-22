import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ScheduleExceptionDto, CreateScheduleExceptionDto } from '../model/schedule-exception-dto';
import { Environment } from '../utils/environment';

@Injectable({
  providedIn: 'root',
})
export class ScheduleExceptionService {
  private baseUrl = Environment.getInstance().apiUrl + 'schedule-exception';

  private exceptionsSubject = new BehaviorSubject<ScheduleExceptionDto[]>([]);
  public exceptions$ = this.exceptionsSubject.asObservable();

  private currentOperatorIdLoaded: string | null = null;

  constructor(private http: HttpClient) {}

  getOperatorScheduleExceptions(operatorId: string, forceRefresh: boolean = false): Observable<ScheduleExceptionDto[]> {
    if (this.currentOperatorIdLoaded === operatorId && !forceRefresh) {
      return this.exceptions$;
    }

    const params = new HttpParams().set('operatorId', operatorId);

    return this.http.get<ScheduleExceptionDto[]>(this.baseUrl, { params }).pipe(
      tap(exceptions => {
        this.currentOperatorIdLoaded = operatorId;
        this.exceptionsSubject.next(exceptions);
      })
    );
  }

  createScheduleException(dto: CreateScheduleExceptionDto): Observable<ScheduleExceptionDto> {
    return this.http.post<ScheduleExceptionDto>(this.baseUrl, dto).pipe(
      tap(newException => {
        if (this.currentOperatorIdLoaded === dto.operatorId) {
          const currentList = this.exceptionsSubject.getValue();
          this.exceptionsSubject.next([...currentList, newException]);
        }
      })
    );
  }

  deleteScheduleException(scheduleExceptionsId: string): Observable<void> {
    const params = new HttpParams().set('scheduleExceptionsId', scheduleExceptionsId);

    return this.http.delete<void>(this.baseUrl, { params }).pipe(
      tap(() => {
        const currentList = this.exceptionsSubject.getValue();
        const filteredList = currentList.filter(e => e.id !== scheduleExceptionsId);
        this.exceptionsSubject.next(filteredList);
      })
    );
  }
}
