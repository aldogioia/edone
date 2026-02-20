import { Injectable } from '@angular/core';
import {Environment} from '../utils/Enviroment';
import {HttpClient} from '@angular/common/http';
import {StandardScheduleDto} from '../model/standard-schedule-dto';
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
}
