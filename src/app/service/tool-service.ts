import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateToolDto, ToolDto, UpdateToolDto} from '../model/tool-dto';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private baseUrl = 'http://localhost:8080/api/v1/tool';

  constructor(private http: HttpClient) {}

  getAllTools(): Observable<ToolDto[]> {
    return this.http.get<ToolDto[]>(`${this.baseUrl}`).pipe(
      map(list => list.map(item => new ToolDto(item)))
    );
  }

  createTool(dto: CreateToolDto): Observable<ToolDto> {
    return this.http.post(`${this.baseUrl}`, dto).pipe(
      map(data => new ToolDto(data))
    );
  }

  updateTool(dto: UpdateToolDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}`, dto);
  }
}
