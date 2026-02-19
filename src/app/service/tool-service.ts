import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private baseUrl = 'http://localhost:8080/api/v1/tool';

  constructor(private http: HttpClient) {}

  createTool(name: string, availability: number) {
    const data = {
      name: name,
      availability: availability
    }

    return this.http.post(`${this.baseUrl}`, data);
  }
}
