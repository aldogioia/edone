import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ScheduleExceptionService } from '../../../service/schedule-exception-service';
import { OperatorsService } from '../../../service/operators-service';
import { OperatorDto } from '../../../model/operator-dto';
import {
  ScheduleExceptionDto,
  CreateScheduleExceptionDto,
  UpdateScheduleExceptionDto
} from '../../../model/schedule-exception-dto';
import { periodValidator, scheduleInfoValidator } from '../../../validators/schedule-exception-validators';
import {Add01Icon, Cancel01Icon, Refresh01Icon, CalendarBlock01Icon} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-schedule-exception-page',
  standalone: false,
  templateUrl: './schedule-exception-page.html',
  styleUrls: [
    './schedule-exception-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css',
    '../../../../../public/css/schedule.css'
  ]
})
export class ScheduleExceptionPage implements OnInit, OnDestroy {
  protected readonly Refresh01Icon = Refresh01Icon;
  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;
  protected readonly CalendarBlock01Icon = CalendarBlock01Icon;

  operators: OperatorDto[] = [];
  selectedOperator: OperatorDto | null = null;
  exceptions: ScheduleExceptionDto[] = [];

  exceptionForm!: FormGroup;
  isFormOpen = false;
  isLoadingOperators = false;
  isLoadingExceptions = false;
  isSaving = false;

  editingExceptionId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private operatorService: OperatorsService,
    private exceptionService: ScheduleExceptionService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadOperators();
    this.setupFormListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.exceptionForm = this.formBuilder.group({
      startDate: ['', [Validators.required]],
      endDate: [''],
      isMorningOff: [true],
      morningStart: [{ value: '', disabled: true }],
      morningEnd: [{ value: '', disabled: true }],
      isAfternoonOff: [true],
      afternoonStart: [{ value: '', disabled: true }],
      afternoonEnd: [{ value: '', disabled: true }]
    }, { validators: [periodValidator, scheduleInfoValidator] });
  }

  private setupFormListeners() {
    this.exceptionForm.get('isMorningOff')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOff => {
        const startCtrl = this.exceptionForm.get('morningStart');
        const endCtrl = this.exceptionForm.get('morningEnd');
        if (isOff) {
          startCtrl?.disable(); endCtrl?.disable();
          startCtrl?.setValue(''); endCtrl?.setValue('');
        } else {
          startCtrl?.enable(); endCtrl?.enable();
        }
      });

    this.exceptionForm.get('isAfternoonOff')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOff => {
        const startCtrl = this.exceptionForm.get('afternoonStart');
        const endCtrl = this.exceptionForm.get('afternoonEnd');
        if (isOff) {
          startCtrl?.disable(); endCtrl?.disable();
          startCtrl?.setValue(''); endCtrl?.setValue('');
        } else {
          startCtrl?.enable(); endCtrl?.enable();
        }
      });
  }

  loadOperators() {
    this.isLoadingOperators = true;
    this.operatorService.loadAllOperators().subscribe({
      next: (ops) => {
        this.operators = ops;
        this.isLoadingOperators = false;
        if (ops.length > 0) this.selectOperator(ops[0]);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento operatori', err);
        this.isLoadingOperators = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectOperator(operator: OperatorDto) {
    this.selectedOperator = operator;
    this.isFormOpen = false;
    this.loadExceptions(operator.id);
  }

  isOperatorSelected(operator: OperatorDto) {
    return this.selectedOperator?.id === operator.id;
  }

  loadExceptions(operatorId: string) {
    this.isLoadingExceptions = true;
    this.exceptionService.getOperatorScheduleExceptions(operatorId).subscribe({
      next: (ex) => {
        this.exceptions = ex;
        this.isLoadingExceptions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento eccezioni', err);
        this.isLoadingExceptions = false;
        this.cdr.detectChanges();
      }
    });
  }

  forceRefreshList() {
    if (this.selectedOperator) {
      this.isLoadingExceptions = true;
      this.exceptionService.getOperatorScheduleExceptions(this.selectedOperator.id, true).subscribe({
        next: (ex) => {
          this.exceptions = ex;
          this.isLoadingExceptions = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getFormControl(name: string) {
    return this.exceptionForm.get(name);
  }

  openCreateForm() {
    if (!this.selectedOperator) {
      alert("Seleziona un operatore dalla lista a sinistra prima di aggiungere un'eccezione.");
      return;
    }
    this.isFormOpen = true;
    this.editingExceptionId = null;
    this.exceptionForm.reset({
      isMorningOff: true,
      isAfternoonOff: true
    });
  }

  editException(ex: ScheduleExceptionDto) {
    if (!this.selectedOperator) return;

    this.isFormOpen = true;
    this.editingExceptionId = ex.id;

    const isMorningOff = !ex.morningStart && !ex.morningEnd;
    const isAfternoonOff = !ex.afternoonStart && !ex.afternoonEnd;

    this.exceptionForm.patchValue({
      startDate: ex.startDate,
      endDate: ex.endDate,
      isMorningOff: isMorningOff,
      morningStart: isMorningOff ? '' : ex.morningStart?.substring(0, 5),
      morningEnd: isMorningOff ? '' : ex.morningEnd?.substring(0, 5),
      isAfternoonOff: isAfternoonOff,
      afternoonStart: isAfternoonOff ? '' : ex.afternoonStart?.substring(0, 5),
      afternoonEnd: isAfternoonOff ? '' : ex.afternoonEnd?.substring(0, 5)
    });
  }

  closeForm() {
    this.isFormOpen = false;
    this.editingExceptionId = null;
    this.exceptionForm.reset();
  }

  onSubmit() {
    if (this.exceptionForm.invalid || this.isSaving || !this.selectedOperator) return;

    this.isSaving = true;
    const val = this.exceptionForm.getRawValue();

    const baseDto = {
      operatorId: this.selectedOperator.id,
      startDate: val.startDate,
      endDate: val.endDate ? val.endDate : undefined,
      morningStart: val.isMorningOff ? undefined : val.morningStart,
      morningEnd: val.isMorningOff ? undefined : val.morningEnd,
      afternoonStart: val.isAfternoonOff ? undefined : val.afternoonStart,
      afternoonEnd: val.isAfternoonOff ? undefined : val.afternoonEnd
    };

    if (this.editingExceptionId) {
      const updateDto: UpdateScheduleExceptionDto = {...baseDto, id: this.editingExceptionId};
      this.exceptionService.updateScheduleException(updateDto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm();
          this.loadExceptions(this.selectedOperator!.id);
        },
        error: (err) => this.handleSaveError(err)
      });
    } else {
      const createDto: CreateScheduleExceptionDto = baseDto;
      this.exceptionService.createScheduleException(createDto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm();
          this.loadExceptions(this.selectedOperator!.id);
        },
        error: (err) => this.handleSaveError(err)
      });
    }
  }

  deleteException(event: Event) {
    event.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questa eccezione/ferie?')) return;

    if (this.editingExceptionId === null) return;

    this.isSaving = true;
    this.exceptionService.deleteScheduleException(this.editingExceptionId).subscribe({
      next: () => {
        this.isSaving = false;
        this.exceptions = this.exceptions.filter(e => e.id !== this.editingExceptionId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore eliminazione:', err);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDateRange(start: string, end?: string): string {
    if (!end || start === end) return start;
    return `Dal ${start} al ${end}`;
  }

  get isMorningInvalid(): boolean {
    const isTouched = this.getFormControl('morningStart')?.touched || this.getFormControl('morningEnd')?.touched;
    return this.exceptionForm.hasError('invalidMorning') && !!isTouched;
  }

  get isMorningValid(): boolean {
    const isOff = this.getFormControl('isMorningOff')?.value;
    if (isOff) return true;

    const start = this.getFormControl('morningStart');
    const end = this.getFormControl('morningEnd');
    const isTouchedAndDirty = (start?.touched && end?.touched) || (start?.dirty && end?.dirty);
    const hasValues = start?.value && end?.value;

    return !!isTouchedAndDirty && !!hasValues && !this.exceptionForm.hasError('invalidMorning');
  }

  get isAfternoonInvalid(): boolean {
    const isTouched = this.getFormControl('afternoonStart')?.touched || this.getFormControl('afternoonEnd')?.touched;
    return this.exceptionForm.hasError('invalidAfternoon') && !!isTouched;
  }

  get isAfternoonValid(): boolean {
    const isOff = this.getFormControl('isAfternoonOff')?.value;
    if (isOff) return true;

    const start = this.getFormControl('afternoonStart');
    const end = this.getFormControl('afternoonEnd');
    const isTouchedAndDirty = (start?.touched && end?.touched) || (start?.dirty && end?.dirty);
    const hasValues = start?.value && end?.value;

    return !!isTouchedAndDirty && !!hasValues && !this.exceptionForm.hasError('invalidAfternoon');
  }

  get hasOverlapError(): boolean {
    const mEnd = this.getFormControl('morningEnd')?.touched;
    const pStart = this.getFormControl('afternoonStart')?.touched;
    return this.exceptionForm.hasError('overlap') && (!!mEnd || !!pStart);
  }

  private handleSaveError(err: any) {
    this.isSaving = false;
    console.error(err);
    this.cdr.detectChanges();
  }
}
