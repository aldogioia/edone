import { Injectable } from '@angular/core';
import {Environment} from '../utils/Enviroment';
import {HttpClient} from '@angular/common/http';
import {ServiceDto} from '../model/service-dto';
import {BehaviorSubject, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private baseUrl = Environment.getInstance().apiUrl + 'service'

  private servicesSubject = new BehaviorSubject<ServiceDto[]>([]);
  public services$ = this.servicesSubject.asObservable();

  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadAllServices(forceRefresh: boolean = false) {
    if(this.hasLoaded && !forceRefresh)
      return this.services$


    return this.http.get<ServiceDto[]>(this.baseUrl + "/all").pipe(
      tap(services => {
        this.hasLoaded = true;
        this.servicesSubject.next(services);
        return services;
      })
    )
  }
}
