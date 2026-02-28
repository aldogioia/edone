import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventSourceFuncArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {forkJoin, Observable, of, Subject, combineLatest, tap} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil} from 'rxjs/operators';

import { BookingService } from '../../../service/booking-service';
import { OperatorsService } from '../../../service/operators-service';
import { ServiceService } from '../../../service/service-service';
import { CustomersService } from '../../../service/customers-service';

import { BookingDto, CreateBookingDto } from '../../../model/booking-dto';
import { OperatorDto } from '../../../model/operator-dto';
import { ServiceDto } from '../../../model/service-dto';
import { CustomerDto } from '../../../model/customer-dto';

import { Add01Icon, Cancel01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-booking-page',
  standalone: false,
  templateUrl: './booking-page.html',
  styleUrls: [
    './booking-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class BookingPage implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  customers$!: Observable<CustomerDto[]>;
  customerInput$ = new Subject<string>();
  isCustomersLoading = false;

  operators: OperatorDto[] = [];
  services: ServiceDto[] = [];
  customers: CustomerDto[] = [];

  selectedOperator: OperatorDto | null = null;
  filteredOperatorsForForm: OperatorDto[] = [];
  availableTimes: string[] = [];
  isLoadingTimes = false;

  selectedBookingId: string | null = null;

  bookingForm!: FormGroup;
  isFormOpen = false;
  isViewMode = false;
  isLoadingData = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  protected readonly Refresh01Icon = Refresh01Icon;
  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridDay',
    headerToolbar: {
      left: 'prev,next title',
      right: 'timeGridDay,timeGridWeek'
    },
    locale: 'it',
    slotMinTime: '08:00:00',
    slotMaxTime: '21:10:00',
    allDaySlot: false,

    height: 'auto',
    slotDuration: '00:10:00',
    slotEventOverlap: false,
    eventMinHeight: 40,
    stickyHeaderDates: false,

    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      hour12: false
    },

    events: this.fetchEvents.bind(this),
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(
    private formBuilder: FormBuilder,
    private bookingService: BookingService,
    private operatorService: OperatorsService,
    private serviceService: ServiceService,
    private customerService: CustomersService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
    this.setupCustomerSearch();
  }

  ngOnInit() {
    this.loadAllData();
    this.setupFormListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.bookingForm = this.formBuilder.group({
      service: ['', [Validators.required]],
      operator: [{ value: '', disabled: true }, [Validators.required]],
      date: ['', [Validators.required]],
      time: [{ value: '', disabled: true }, [Validators.required]],
      customer: ['', [Validators.required]]
    });
  }

  getFormControl(name: string) { return this.bookingForm.get(name); }

  loadAllData() {
    this.isLoadingData = true;
    forkJoin({
      operators: this.operatorService.loadAllOperators(),
      services: this.serviceService.loadAllServices()
    }).subscribe({
      next: (res) => {
        this.operators = res.operators;
        this.services = res.services;
        this.isLoadingData = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingData = false; }
    });
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

  selectOperator(operator: OperatorDto | null) {
    this.selectedOperator = operator;
    if (this.calendarComponent) {
      this.calendarComponent.getApi().refetchEvents();
    }
  }

  isOperatorSelected(operator: OperatorDto | null) {
    if (operator === null) return this.selectedOperator === null;
    return this.selectedOperator?.id === operator.id;
  }

  private setupFormListeners() {
    const serviceCtrl = this.bookingForm.get('service')!;
    const operatorCtrl = this.bookingForm.get('operator')!;
    const dateCtrl = this.bookingForm.get('date')!;
    const timeCtrl = this.bookingForm.get('time')!;

    serviceCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(serviceId => {
      if (this.isViewMode) return;

      operatorCtrl.reset();
      timeCtrl.reset();

      if (serviceId) {
        this.filteredOperatorsForForm = this.operators.filter(op =>
          op.operatorServices?.some((os: any) => os.serviceId === serviceId)
        );
        operatorCtrl.enable();
      } else {
        this.filteredOperatorsForForm = [];
        operatorCtrl.disable();
      }
    });

    combineLatest([
      serviceCtrl.valueChanges.pipe(startWith(serviceCtrl.value)),
      operatorCtrl.valueChanges.pipe(startWith(operatorCtrl.value)),
      dateCtrl.valueChanges.pipe(startWith(dateCtrl.value))
    ]).pipe(takeUntil(this.destroy$)).subscribe(([serviceId, operatorId, date]) => {
      if (this.isViewMode) return;

      if (serviceId && operatorId && date) {
        this.isLoadingTimes = true;
        timeCtrl.disable();

        this.operatorService.getAvailableTimes(operatorId, date, serviceId).subscribe({
          next: (times) => {
            this.availableTimes = times;
            this.isLoadingTimes = false;
            if (times.length > 0) timeCtrl.enable();
            this.cdr.detectChanges();
          },
          error: () => {
            this.availableTimes = [];
            this.isLoadingTimes = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.availableTimes = [];
        timeCtrl.reset();
        timeCtrl.disable();
      }
    });
  }

  fetchEvents(fetchInfo: EventSourceFuncArg, successCallback: any, _: any) {
    const requests: Observable<BookingDto[]>[] = [];
    let current = new Date(fetchInfo.start);
    const end = new Date(fetchInfo.end);

    while (current < end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const req = this.bookingService.getBookingsByDate(dateStr).pipe(
        catchError(() => of([] as BookingDto[]))
      );
      requests.push(req);
      current.setDate(current.getDate() + 1);
    }

    forkJoin(requests).subscribe(results => {
      let allBookings = results.flat();

      if (this.selectedOperator !== null) {
        allBookings = allBookings.filter(b => b.operator?.id === this.selectedOperator!.id);
      }

      const calendarEvents = allBookings.map(b => {

        return {
          id: b.id,
          title: `${b.customer?.name} - ${b.service?.name}` + (!this.selectedOperator ? ` (${b.operator?.name})` : ''),
          start: `${b.date}T${b.time}`,
          end: `${b.date}T${b.end}`,
          extendedProps: { booking: b }
        };
      });

      successCallback(calendarEvents);
    });
  }

  handleEventClick(arg: EventClickArg) {
    const booking: BookingDto = arg.event.extendedProps['booking'];

    this.isViewMode = true;
    this.isFormOpen = true;
    this.selectedBookingId = booking.id;

    this.availableTimes = [booking.time.substring(0, 5)];

    this.bookingForm.patchValue({
      service: booking.service?.id,
      operator: booking.operator?.id,
      date: booking.date,
      time: booking.time.substring(0, 5),
      customer: booking.customer?.id // ng-select userà questo ID
    });

    this.bookingForm.disable();
  }

  openCreateForm() {
    this.isFormOpen = true;
    this.isViewMode = false;
    this.selectedBookingId = null;
    this.availableTimes = [];

    this.bookingForm.enable();
    this.bookingForm.reset({
      customer: null,
      service: '',
      operator: '',
      date: '',
      time: ''
    });

    this.bookingForm.get('operator')?.disable();
    this.bookingForm.get('time')?.disable();
  }

  closeForm() {
    this.isFormOpen = false;
    this.bookingForm.reset({
      customer: '',
      service: '',
      operator: '',
      date: '',
      time: ''
    });
    this.bookingForm.enable();
  }

  forceRefreshList() {
    if (this.calendarComponent) this.calendarComponent.getApi().refetchEvents();
  }

  onSubmit() {
    if (this.bookingForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const val = this.bookingForm.getRawValue();

    const dto: CreateBookingDto = {
      date: val.date,
      time: val.time,
      service: val.service,
      customer: val.customer,
      operator: val.operator
    };

    this.bookingService.createBooking(dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeForm();
        this.forceRefreshList();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  deleteBooking(event: Event) {
    event.preventDefault();
    if (!this.selectedBookingId || !confirm("Vuoi davvero eliminare questo appuntamento?")) return;

    this.isSaving = true;
    this.bookingService.deleteBooking(this.selectedBookingId).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeForm();
        this.forceRefreshList();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
      }
    });
  }
}
