import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Refresh01Icon } from '@hugeicons/core-free-icons';
import { Subject, Observable, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { BookingService } from '../../../service/booking-service';
import { CustomersService } from '../../../service/customers-service';
import { CustomerDto } from '../../../model/customer-dto';
import { BookingDto } from '../../../model/booking-dto';

@Component({
  selector: 'app-customer-bookings',
  standalone: false,
  templateUrl: './customer-bookings.html',
  styleUrls: [
    './customer-bookings.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/typography.css'
  ]
})
export class CustomerBookings implements OnInit, OnDestroy {
  protected readonly Refresh01Icon = Refresh01Icon;

  customerControl = new FormControl<CustomerDto | null>(null);

  customers$!: Observable<CustomerDto[]>;
  customerInput$ = new Subject<string>();
  isCustomersLoading = false;

  bookings: BookingDto[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private customerService: CustomersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setupCustomerSearch();
    this.listenToCustomerSelection();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupCustomerSearch() {
    this.customers$ = combineLatest([
      this.customerService.getCustomersPage(0, 50).pipe(map(page => page.content)),
      this.customerInput$.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          this.isCustomersLoading = true;
          if (term) {
            return this.customerService.searchCustomers(term).pipe(
              catchError(() => of([])),
              tap(() => this.isCustomersLoading = false)
            );
          } else {
            return this.customerService.getCustomersPage(0, 50).pipe(
              map(page => page.content),
              catchError(() => of([])),
              tap(() => this.isCustomersLoading = false)
            );
          }
        })
      )
    ]).pipe(
      map(([baseCustomers, searchedCustomers]) => {
        this.isCustomersLoading = false;
        return searchedCustomers.length > 0 ? searchedCustomers : baseCustomers;
      })
    );
  }

  private listenToCustomerSelection() {
    this.customerControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(selectedCustomer => {
      if (selectedCustomer && selectedCustomer.id) {
        setTimeout(() => this.fetchBookings(selectedCustomer.id));
      } else {
        setTimeout(() => {
          this.bookings = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  private fetchBookings(customerId: string) {
    this.isLoading = true;
    this.bookings = [];
    this.cdr.detectChanges();

    this.bookingService.getCustomerBookings(customerId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nel recupero degli appuntamenti", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  forceRefreshList() {
    const currentCustomer = this.customerControl.value;
    if (currentCustomer && currentCustomer.id) {
      this.fetchBookings(currentCustomer.id);
    }
  }

  getOperatorNames(booking: BookingDto): string {
    if (!booking.operators || booking.operators.length === 0) return 'Nessun operatore';
    return booking.operators.map(op => `${op.name} ${op.surname}`).join(', ');
  }

  deleteBooking(id: string) {
    if (!confirm("Vuoi davvero eliminare questo appuntamento?")) return;

    this.bookingService.deleteBooking(id).subscribe({
      next: () => {
        this.forceRefreshList();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
