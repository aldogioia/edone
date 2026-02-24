import { Injectable } from '@angular/core';
import {Environment} from '../utils/environment';
import {HttpClient} from '@angular/common/http';
import {CreateStandardScheduleDto, StandardScheduleDto, UpdateStandardScheduleDto} from '../model/schedule-dto';
import {HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private baseUrl = Environment.getInstance().apiUrl + 'standard-schedule';

  private schedulesSubject = new BehaviorSubject<StandardScheduleDto[]>([]);
  public schedules$ = this.schedulesSubject.asObservable();

  private currentOperatorIdLoaded: string | null = null;

  constructor(private http: HttpClient) {}

  getOperatorStandardSchedule(operatorId: string, forceRefresh: boolean = false): Observable<StandardScheduleDto[]> {
    if (this.currentOperatorIdLoaded === operatorId && !forceRefresh) {
      return this.schedules$;
    }

    let params = new HttpParams().set('operatorId', operatorId);
    return this.http.get<StandardScheduleDto[]>(`${this.baseUrl}`, { params }).pipe(
      tap(schedules => {
        this.currentOperatorIdLoaded = operatorId;
        this.schedulesSubject.next(schedules);
      })
    )
  }

  createStandardSchedule(schedule: CreateStandardScheduleDto) {
    return this.http.post<StandardScheduleDto>(`${this.baseUrl}`, schedule).pipe(
      tap(newSchedule => {
        if (this.currentOperatorIdLoaded === schedule.operatorId) {
          const currentList = this.schedulesSubject.getValue();
          this.schedulesSubject.next([...currentList, newSchedule]);
        }
      })
    );
  }


  updateStandardSchedule(schedule: UpdateStandardScheduleDto) {
    return this.http.patch<StandardScheduleDto>(this.baseUrl, schedule).pipe(
      tap(updatedSchedule => {
        if (this.currentOperatorIdLoaded === schedule.operatorId) {
          const currentList = this.schedulesSubject.getValue();
          const updatedList = currentList.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
          this.schedulesSubject.next(updatedList);
        }
      })
    )
  }

  deleteStandardSchedule(standardScheduleId: string) {
    let params = new HttpParams().set('standardScheduleId', standardScheduleId);

    return this.http.delete(this.baseUrl, { params }).pipe(
      tap(() => {
        const currentList = this.schedulesSubject.getValue();
        const filteredList = currentList.filter(s => s.id !== standardScheduleId);
        this.schedulesSubject.next(filteredList);
      })
    );
  }
}
