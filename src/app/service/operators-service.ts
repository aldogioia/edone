import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  OperatorDto,
  SummaryOperatorDto,
  CreateOperatorDto,
  UpdateOperatorDto
} from '../model/operator-dto';
import {Environment} from '../utils/environment';

@Injectable({
  providedIn: 'root'
})
export class OperatorsService {
  private baseUrl = Environment.getInstance().apiUrl + 'operator';

  private operatorsSubject = new BehaviorSubject<OperatorDto[]>([]);
  public operators$ = this.operatorsSubject.asObservable();

  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadAllOperators(forceRefresh: boolean = false): Observable<OperatorDto[]> {
    if (this.hasLoaded && !forceRefresh) {
      return this.operators$;
    }

    return this.http.get<OperatorDto[]>(`${this.baseUrl}/all`).pipe(
      tap(operators => {
        this.hasLoaded = true;
        this.operatorsSubject.next(operators);
      })
    );
  }

  refreshCache(): Observable<OperatorDto[]> {
    return this.loadAllOperators(true);
  }

  getOperatorById(id: string): Observable<OperatorDto> {
    const params = new HttpParams().set('operatorId', id);
    return this.http.get<OperatorDto>(`${this.baseUrl}/one`, { params });
  }

  getOperatorsByService(serviceId: string): Observable<SummaryOperatorDto[]> {
    const params = new HttpParams().set('serviceId', serviceId);
    return this.http.get<SummaryOperatorDto[]>(`${this.baseUrl}/byService`, { params });
  }

  getAvailableTimes(operatorId: string, date: string, serviceId: string): Observable<string[]> {
    const params = new HttpParams()
      .set('operatorId', operatorId)
      .set('date', date)
      .set('serviceId', serviceId);
    return this.http.get<string[]>(`${this.baseUrl}/availableTimes`, { params });
  }

  createOperator(dto: CreateOperatorDto, imageFile?: File): Observable<OperatorDto> {
    const formData = new FormData();

    formData.append(
      'createOperatorDto',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('image', new Blob(), '');
    }

    return this.http.post<OperatorDto>(this.baseUrl, formData).pipe(
      tap(newOperator => {
        const currentList = this.operatorsSubject.getValue();
        this.operatorsSubject.next([newOperator, ...currentList]);
      })
    );
  }

  updateOperator(dto: UpdateOperatorDto, imageFile?: File): Observable<OperatorDto> {
    const formData = new FormData();

    formData.append(
      'updateOperatorDto',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.patch<OperatorDto>(this.baseUrl, formData).pipe(
      tap(updatedOperator => {
        const currentList = this.operatorsSubject.getValue();
        const index = currentList.findIndex(o => o.id === updatedOperator.id);

        if (index !== -1) {
          currentList[index] = updatedOperator;
          this.operatorsSubject.next([...currentList]);
        }
      })
    );
  }

  deleteOperator(operatorId: string): Observable<void> {
    const params = new HttpParams().set('operatorId', operatorId);
    return this.http.delete<void>(this.baseUrl, { params }).pipe(
      tap(() => {
        const currentList = this.operatorsSubject.getValue();
        const filteredList = currentList.filter(o => o.id !== operatorId);
        this.operatorsSubject.next(filteredList);
      })
    );
  }
}
