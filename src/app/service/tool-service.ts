import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateToolDto, ToolDto, UpdateToolDto} from '../model/tool-dto';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Environment} from '../utils/Enviroment';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private baseUrl = Environment.getInstance().apiUrl + 'tool';

  private toolsSubject = new BehaviorSubject<ToolDto[]>([]);
  public tools$ = this.toolsSubject.asObservable();

  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadAllTools(forceRefresh: boolean = false): Observable<ToolDto[]> {
    if (this.hasLoaded && !forceRefresh) {
      return this.tools$;
    }

    return this.http.get<ToolDto[]>(`${this.baseUrl}`).pipe(
      tap(tools => {
        this.hasLoaded = true;
        this.toolsSubject.next(tools);
      })
    );
  }

  refreshCache(): Observable<ToolDto[]> {
    return this.loadAllTools(true);
  }


  createTool(dto: CreateToolDto) {
    return this.http.post<ToolDto>(this.baseUrl, dto).pipe(
      tap(newTool =>{
        const currentTools = this.toolsSubject.value;
        this.toolsSubject.next([...currentTools, newTool]);
      })
    );
  }

  updateTool(dto: UpdateToolDto){
    return this.http.put<ToolDto>(this.baseUrl, dto).pipe(
      tap((res: ToolDto) => {
        const currentTools = this.toolsSubject.getValue()
        const index = currentTools.findIndex(tool => tool.id === res.id)
        if(index !== -1) {
          currentTools[index] = res
          this.toolsSubject.next([...currentTools])
        }
      })
    )
  }

  deleteTool(toolId: string) {
    return this.http.delete<void>(`${this.baseUrl}`, {
      params: { toolId }
    }).pipe(
      tap(() => {
        const currentTools = this.toolsSubject.getValue();
        const updatedTools = currentTools.filter(tool => tool.id !== toolId);
        this.toolsSubject.next(updatedTools);
      })
    );
  }
}
