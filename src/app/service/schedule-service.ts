import { Injectable } from '@angular/core';
import {Environment} from '../utils/Enviroment';
import {HttpClient} from '@angular/common/http';
import {CreateStandardScheduleDto, StandardScheduleDto, UpdateStandardScheduleDto} from '../model/schedule-dto';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private baseUrl = Environment.getInstance().apiUrl + 'standard-schedule';

  constructor(private http: HttpClient) {}

  getOperatorStandardSchedule(operatorId: string) {
    let params = new HttpParams()
      .set('operatorId', operatorId);

    return this.http.get<StandardScheduleDto[]>(`${this.baseUrl}`, { params })
  }

  createStandardSchedule(schedule: CreateStandardScheduleDto) {
    return this.http.post<StandardScheduleDto>(`${this.baseUrl}`, schedule);
  }


  updateStandardSchedule(schedule: UpdateStandardScheduleDto) {
    return this.http.patch<StandardScheduleDto>(this.baseUrl, schedule)
  }

  deleteStandardSchedule(standardScheduleId: string) {
    let params = new HttpParams()
      .set('standardScheduleId', standardScheduleId);

    return this.http.delete(this.baseUrl, { params });
  }
}
