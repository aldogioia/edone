import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CustomerDto,
  CreateCustomerWithoutPasswordDto,
  UpdateCustomerDto,
  Page
} from '../model/customer-dto';
import {Environment} from '../utils/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private baseUrl = Environment.getInstance().apiUrl + 'customer';

  constructor(private http: HttpClient) {}

  createCustomer(dto: CreateCustomerWithoutPasswordDto): Observable<CustomerDto> {
    return this.http.post<any>(this.baseUrl, dto).pipe(
      map(data => new CustomerDto(data))
    );
  }

  getCustomersPage(page: number = 0, size: number = 100): Observable<Page<CustomerDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/page`, { params }).pipe(
      map(response => {
        response.content = response.content.map((item: any) => new CustomerDto(item));
        return response;
      })
    );
  }

  searchCustomers(query: string): Observable<CustomerDto[]> {
    const params = new HttpParams().set('query', query);

    return this.http.get<any[]>(`${this.baseUrl}/search`, { params }).pipe(
      map(list => list.map(item => new CustomerDto(item)))
    );
  }

  updateCustomer(dto: UpdateCustomerDto): Observable<void> {
    return this.http.patch<void>(this.baseUrl, dto);
  }

  deleteCustomer(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
