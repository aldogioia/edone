import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventSourceFuncArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { forkJoin, Observable, of, Subject, combineLatest } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { BookingService } from '../../../service/booking-service';
import { OperatorsService } from '../../../service/operators-service';
import { ServiceService } from '../../../service/service-service';
import { CustomersService } from '../../../service/customers-service';

import { BookingDto, CreateBookingDto, UpdateBookingDto } from '../../../model/booking-dto';
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

  selectedOperators: OperatorDto[] = [];
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

    // --- AGGIUNGI QUESTO BLOCCO ---
    eventContent: (arg) => {
      const timeText = arg.timeText;
      const titleText = arg.event.title;
      const opColor = arg.event.extendedProps['opColor'];

      return {
        html: `
          <div class="fc-event-main-frame">
            ${timeText ? `<div class="fc-event-time" style="color: ${opColor}; font-weight: 700; font-size: 0.9em;">${timeText}</div>` : ''}
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky" style="color: #333333; font-weight: 500;">${titleText}</div>
            </div>
          </div>
        `
      };
    }
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
      operator1: [{ value: '', disabled: true }, [Validators.required]],
      operator2: [{ value: '', disabled: true }],
      date: ['', [Validators.required]],
      time: [{ value: '', disabled: true }, [Validators.required]],
      duration: [30, [Validators.required, Validators.min(1)]],
      customer: ['', [Validators.required]]
    });
  }

  getFormControl(name: string) { return this.bookingForm.get(name); }

  get isMultiOperatorService(): boolean {
    const serviceId = this.bookingForm.get('service')?.value;
    if (!serviceId) return false;
    const service = this.services.find(s => s.id === serviceId);
    return service?.multiOperator || false;
  }

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
    if (operator === null) {
      this.selectedOperators = [];
    } else {
      const index = this.selectedOperators.findIndex(o => o.id === operator.id);

      if (index > -1) {
        this.selectedOperators.splice(index, 1);
      } else {
        this.selectedOperators.push(operator);
      }
    }

    if (this.calendarComponent) {
      this.calendarComponent.getApi().refetchEvents();
    }
  }

  isOperatorSelected(operator: OperatorDto | null): boolean {
    if (operator === null) return this.selectedOperators.length === 0;
    return this.selectedOperators.some(o => o.id === operator.id);
  }

  recommendedDuration(): number {
    const serviceId = this.getFormControl('service')?.value;
    const operatorId = this.getFormControl('operator1')?.value;
    if (!serviceId || !operatorId) return 30;

    const operator = this.operators.find(o => o.id === operatorId);
    if (!operator) return 30;

    const operatorService = operator.operatorServices?.find(os => os.serviceId === serviceId);
    return operatorService?.duration ?? 30;
  }

  private setupFormListeners() {
    const serviceCtrl = this.bookingForm.get('service')!;
    const operator1Ctrl = this.bookingForm.get('operator1')!;
    const operator2Ctrl = this.bookingForm.get('operator2')!;
    const dateCtrl = this.bookingForm.get('date')!;
    const timeCtrl = this.bookingForm.get('time')!;
    const durationCtrl = this.bookingForm.get('duration')!;

    serviceCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(serviceId => {
      if (this.isViewMode) return;

      operator1Ctrl.setValue('');
      operator2Ctrl.setValue('');
      timeCtrl.setValue('');

      operator1Ctrl.markAsUntouched();
      operator2Ctrl.markAsUntouched();
      timeCtrl.markAsUntouched();

      if (serviceId) {
        const selectedService = this.services.find(s => s.id === serviceId);

        if (selectedService?.multiOperator) {
          operator2Ctrl.setValidators([Validators.required]);
        } else {
          operator2Ctrl.clearValidators();
        }
        operator2Ctrl.updateValueAndValidity();

        this.filteredOperatorsForForm = this.operators.filter(op =>
          op.operatorServices?.some((os: any) => os.serviceId === serviceId)
        );
        operator1Ctrl.enable();
        operator2Ctrl.enable();
      } else {
        this.filteredOperatorsForForm = [];
        operator1Ctrl.disable();
        operator2Ctrl.disable();
      }
    });

    operator1Ctrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(operatorId => {
      if (this.isViewMode) return;
      if (operatorId && serviceCtrl.value) {
        durationCtrl.setValue(this.recommendedDuration());
      }
    });

    combineLatest([
      serviceCtrl.valueChanges.pipe(startWith(serviceCtrl.value)),
      operator1Ctrl.valueChanges.pipe(startWith(operator1Ctrl.value)),
      operator2Ctrl.valueChanges.pipe(startWith(operator2Ctrl.value)),
      dateCtrl.valueChanges.pipe(startWith(dateCtrl.value)),
      durationCtrl.valueChanges.pipe(startWith(durationCtrl.value))
    ]).pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(([serviceId, op1, op2, date, duration]) => {
      if (this.isViewMode) return;

      if (serviceId && op1 && date && duration) {
        this.isLoadingTimes = true;
        timeCtrl.disable();

        const selectedOps = op2 ? [op1, op2] : [op1];

        this.operatorService.getAvailableTimes(selectedOps, date, serviceId, duration).subscribe({
          next: (times) => {
            this.availableTimes = times;
            this.isLoadingTimes = false;
            timeCtrl.setValue('');
            timeCtrl.markAsUntouched();
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
        timeCtrl.setValue('');
        timeCtrl.markAsUntouched();
        timeCtrl.disable();
      }
    });
  }

  fetchEvents(fetchInfo: EventSourceFuncArg, successCallback: any, _: any) {
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startStr = formatDate(fetchInfo.start);
    const endD = new Date(fetchInfo.end);
    endD.setDate(endD.getDate() - 1);
    const endStr = formatDate(endD);

    this.bookingService.getBookingsByRange(startStr, endStr).subscribe({
      next: (allBookings) => {
        if (this.selectedOperators.length > 0) {
          allBookings = allBookings.filter(b =>
            b.operators?.some(bookingOp =>
              this.selectedOperators.some(selOp => selOp.id === bookingOp.id)
            )
          );
        }

        const calendarEvents = allBookings.map(b => {
          const opNames = b.operators?.map(op => op.name).join(', ');

          const baseColor = (b.operators && b.operators.length > 0 && b.operators[0].bookingColor)
            ? b.operators[0].bookingColor
            : '#202020';

          // Colore di sfondo al 10% di opacità
          const bgColor = baseColor + '1a';

          return {
            id: b.id,
            title: `${b.customer?.name} - ${b.service?.name}` + (this.selectedOperators.length !== 1 ? ` (${opNames})` : ''),
            start: `${b.date}T${b.time}`,
            end: `${b.date}T${b.end}`,

            backgroundColor: bgColor,
            textColor: '#1E293B',

            extendedProps: {
              booking: b,
              opColor: baseColor
            }
          };
        });
        successCallback(calendarEvents);
      },
      error: () => successCallback([])
    });
  }

  private calculateDurationMinutes(start: string, end: string): number {
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    return parseTime(end) - parseTime(start);
  }

  handleEventClick(arg: EventClickArg) {
    const booking: BookingDto = arg.event.extendedProps['booking'];

    this.isViewMode = true;
    this.isFormOpen = true;
    this.selectedBookingId = booking.id;

    this.availableTimes = [booking.time.substring(0, 5)];
    const durationMins = this.calculateDurationMinutes(booking.time, booking.end);

    this.bookingForm.patchValue({
      service: booking.service?.id,
      operator1: booking.operators && booking.operators.length > 0 ? booking.operators[0].id : '',
      operator2: booking.operators && booking.operators.length > 1 ? booking.operators[1].id : '',
      date: booking.date,
      time: booking.time.substring(0, 5),
      duration: durationMins,
      customer: booking.customer
    });

    this.bookingForm.disable();
    this.bookingForm.get('duration')?.enable();
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
      operator1: '',
      operator2: '',
      date: '',
      time: '',
      duration: 30
    });

    this.bookingForm.get('operator1')?.disable();
    this.bookingForm.get('operator2')?.disable();
    this.bookingForm.get('time')?.disable();
  }

  closeForm() {
    this.isFormOpen = false;
    this.bookingForm.reset({
      customer: '',
      service: '',
      operator: '',
      operator2: '',
      date: '',
      time: '',
      duration: 30
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

    if (this.selectedBookingId) {
      const updateDto: UpdateBookingDto = {
        id: this.selectedBookingId,
        duration: val.duration
      };

      this.bookingService.updateBookingDuration(updateDto).subscribe({
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

    } else {
      const opsToSave = [];
      if (val.operator1) opsToSave.push(val.operator1);
      if (val.operator2) opsToSave.push(val.operator2);

      const createDto: CreateBookingDto = {
        date: val.date,
        time: val.time,
        duration: val.duration,
        service: val.service,
        customer: typeof val.customer === 'object' && val.customer !== null ? val.customer.id : val.customer,
        operators: opsToSave
      };

      this.bookingService.createBooking(createDto).subscribe({
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
