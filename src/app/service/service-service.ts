import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Environment } from '../utils/environment';
import {
  ServiceDto,
  CreateServiceDto,
  UpdateServiceDto
} from '../model/service-dto';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private baseUrl = Environment.getInstance().apiUrl + 'service';

  private servicesSubject = new BehaviorSubject<ServiceDto[]>([]);
  public services$ = this.servicesSubject.asObservable();

  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadAllServices(forceRefresh: boolean = false): Observable<ServiceDto[]> {
    if (this.hasLoaded && !forceRefresh) {
      return this.services$.pipe(take(1));
    }

    return this.http.get<ServiceDto[]>(`${this.baseUrl}/all`).pipe(
      tap(services => {
        this.hasLoaded = true;
        this.servicesSubject.next(services);
      })
    );
  }

  refreshCache(): Observable<ServiceDto[]> {
    return this.loadAllServices(true);
  }

  createService(dto: CreateServiceDto, imageFile: File): Observable<ServiceDto> {
    const formData = new FormData();

    formData.append('name', dto.name);
    formData.append('price', dto.price.toString());
    formData.append('persistenceDuration', dto.persistenceDuration.toString());

    if (dto.tools && dto.tools.length > 0) {
      dto.tools.forEach(toolId => {
        formData.append('tools', toolId);
      });
    }

    formData.append('image', imageFile);

    return this.http.post<ServiceDto>(this.baseUrl, formData).pipe(
      tap(newService => {
        const currentList = this.servicesSubject.getValue();
        this.servicesSubject.next([...currentList, newService]);
      })
    );
  }

  updateService(dto: UpdateServiceDto, imageFile?: File): Observable<ServiceDto> {
    const formData = new FormData();

    formData.append('id', dto.id);
    formData.append('name', dto.name);
    formData.append('price', dto.price.toString());
    formData.append('persistenceDuration', dto.persistenceDuration.toString());

    if (dto.tools && dto.tools.length > 0) {
      dto.tools.forEach(toolId => {
        formData.append('tools', toolId);
      });
    } else {
      formData.append('tools', '');
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.patch<ServiceDto>(this.baseUrl, formData).pipe(
      tap(updatedService => {
        const currentList = this.servicesSubject.getValue();
        const index = currentList.findIndex(s => s.id === updatedService.id);
        if (index !== -1) {
          currentList[index] = updatedService;
          this.servicesSubject.next([...currentList]);
        }
      })
    );
  }

  deleteService(serviceId: string): Observable<void> {
    const params = new HttpParams().set('serviceId', serviceId);
    return this.http.delete<void>(this.baseUrl, { params }).pipe(
      tap(() => {
        const currentList = this.servicesSubject.getValue();
        const filteredList = currentList.filter(s => s.id !== serviceId);
        this.servicesSubject.next(filteredList);
      })
    );
  }
}
