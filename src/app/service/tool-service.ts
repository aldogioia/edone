import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateToolDto, ToolDto, UpdateToolDto} from '../model/tool-dto';
import {BehaviorSubject, tap} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private baseUrl = 'http://localhost:8080/api/v1/tool';
  private toolsCache$: BehaviorSubject<ToolDto[] | null> = new BehaviorSubject<ToolDto[] | null>(null)

  constructor(private http: HttpClient) {}

  private loadTools(){
    return this.http.get<ToolDto[]>(this.baseUrl)
  }

  getTools(forceRefresh: boolean = false) {
    if(forceRefresh || this.toolsCache$.value === null) {
      this.loadTools().subscribe(
        tools => this.toolsCache$.next(tools),
      )
    }

    return this.toolsCache$.asObservable().pipe(
      map(tools => tools ?? [])
    )
  }

  createTool(dto: CreateToolDto) {
    return this.http.post<ToolDto>(this.baseUrl, dto).pipe(
      tap((newTool: ToolDto) => {
        const currentTools = this.toolsCache$.value
        if(currentTools)
          this.toolsCache$.next([...currentTools, newTool])
      })
    );
  }

  updateTool(dto: UpdateToolDto){
    return this.http.put(this.baseUrl, dto).pipe(
      tap(() => {
        const currentTools = this.toolsCache$.value
        if(currentTools) {
          const newToolsList = currentTools.map(
            tool => tool.id === dto.id ? dto : tool
          )

          this.toolsCache$.next(newToolsList)
        }
      })
    )
  }

  deleteTool(toolId: string) {
    return this.http.delete<void>(`${this.baseUrl}`, {
      params: { toolId }
    }).pipe(
      tap(() => {
        const currentTools = this.toolsCache$.value
        if(currentTools) {
          const newToolsList = currentTools.filter(
            tool => tool.id !== toolId
          )

          this.toolsCache$.next(newToolsList)
        }
      })
    );
  }
}
