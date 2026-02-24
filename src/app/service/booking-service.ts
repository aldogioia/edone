import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDto, CreateBookingDto } from '../model/booking-dto';
import { Environment } from '../utils/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private baseUrl = Environment.getInstance().apiUrl + 'booking';

  constructor(private http: HttpClient) {}

  getBookingsByDate(date: string, operatorId?: string): Observable<BookingDto[]> {
    let params = new HttpParams().set('date', date);

    if (operatorId) {
      params = params.set('operatorId', operatorId);
    }

    return this.http.get<BookingDto[]>(`${this.baseUrl}/operator`, { params });
  }

  getCustomerBookings(customerId: string): Observable<BookingDto[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<BookingDto[]>(`${this.baseUrl}/customer`, { params });
  }

  createBooking(dto: CreateBookingDto): Observable<BookingDto> {
    return this.http.post<BookingDto>(this.baseUrl, dto);
  }

  deleteBooking(bookingId: string): Observable<void> {
    const params = new HttpParams().set('bookingId', bookingId);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
