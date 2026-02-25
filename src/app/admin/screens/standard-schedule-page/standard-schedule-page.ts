import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {OperatorsService} from '../../../service/operators-service';
import {OperatorDto} from '../../../model/operator-dto';
import {Add01Icon, Cancel01Icon, DateTimeIcon, Refresh01Icon} from '@hugeicons/core-free-icons';
import {CreateStandardScheduleDto, StandardScheduleDto, UpdateStandardScheduleDto} from '../../../model/schedule-dto';
import {ScheduleService} from '../../../service/schedule-service';
import {Shift} from '../../../model/shift';
import {scheduleInfoValidator} from '../../../validators/schedule-exception-validators';

@Component({
  selector: 'app-standard-schedule-page',
  standalone: false,
  templateUrl: './standard-schedule-page.html',
  styleUrls: [
    './standard-schedule-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css',
    '../../../../../public/css/schedule.css'
  ],
})
export class StandardSchedulePage implements OnInit, OnDestroy{
  protected operators: OperatorDto[] = [];
  protected selectedOperator: OperatorDto | null = null;
  protected operatorSchedules: StandardScheduleDto[] = [];

  weekDays = [
    { key: 'MONDAY', label: 'Lunedì' },
    { key: 'TUESDAY', label: 'Martedì' },
    { key: 'WEDNESDAY', label: 'Mercoledì' },
    { key: 'THURSDAY', label: 'Giovedì' },
    { key: 'FRIDAY', label: 'Venerdì' },
    { key: 'SATURDAY', label: 'Sabato' },
    { key: 'SUNDAY', label: 'Domenica' }
  ];

  scheduleForm!: FormGroup

  isLoadingOperators = false;
  isLoadingSchedules = false;

  isFormOpen = false;
  isEditMode = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private operatorService: OperatorsService,
    private scheduleService: ScheduleService
  ) {
    this.initForm()
  }

  ngOnInit(): void {
    this.loadOperators()
    this.setupFormListeners()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectOperator(operator: OperatorDto) {
    this.selectedOperator = operator;
    this.isFormOpen = false;
    this.loadOperatorSchedule(operator.id);
  }

  isOperatorSelected(operator: OperatorDto): boolean {
    return this.selectedOperator?.id === operator.id;
  }

  getShiftsByDay(day: string): Shift[] {
    if (!this.operatorSchedules?.length) return [];

    const schedule = this.operatorSchedules.find(s => s.day === day);
    if (!schedule) return [];

    const shifts: Shift[] = [];

    if (schedule.morningStart && schedule.morningEnd) {
      shifts.push({
        id: schedule.id,
        start: schedule.morningStart,
        end: schedule.morningEnd,
        type: "M"
      });
    }

    if (schedule.afternoonStart && schedule.afternoonEnd) {
      shifts.push({
        id: schedule.id + 1,
        start: schedule.afternoonStart,
        end: schedule.afternoonEnd,
        type: "P"
      });
    }

    return shifts;
  }

  getDaysWithoutShifts() {
    return this.weekDays.filter(day =>
      !this.operatorSchedules.some(schedule => schedule.day === day.key)
    );
  }

  loadOperatorSchedule(operatorId: string) {
    if(this.isLoadingSchedules) return;
    this.isLoadingSchedules = true;

    this.scheduleService.getOperatorStandardSchedule(operatorId).subscribe({
      next: (schedules) => {
        this.operatorSchedules = schedules;
        this.isLoadingSchedules = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingSchedules = false;
        console.error('Failed to load operator schedule', err);
        this.cdr.detectChanges();
      }
    })
  }

  forceRefreshList() {
    if (this.selectedOperator) {
      this.isLoadingSchedules = true;
      this.scheduleService.getOperatorStandardSchedule(this.selectedOperator.id, true).subscribe({
        next: (ex) => {
          this.operatorSchedules = ex;
          this.isLoadingSchedules = false;
          this.cdr.detectChanges();
        }
      });
    }
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

  private setupFormListeners() {
    this.scheduleForm.get('isMorningOff')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOff => {
        const startCtrl = this.scheduleForm.get('morningStart');
        const endCtrl = this.scheduleForm.get('morningEnd');
        if (isOff) {
          startCtrl?.disable(); endCtrl?.disable();
          startCtrl?.setValue(''); endCtrl?.setValue('');
        } else {
          startCtrl?.enable(); endCtrl?.enable();
        }
      });

    this.scheduleForm.get('isAfternoonOff')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOff => {
        const startCtrl = this.scheduleForm.get('afternoonStart');
        const endCtrl = this.scheduleForm.get('afternoonEnd');
        if (isOff) {
          startCtrl?.disable(); endCtrl?.disable();
          startCtrl?.setValue(''); endCtrl?.setValue('');
        } else {
          startCtrl?.enable(); endCtrl?.enable();
        }
      });
  }

  initForm() {
    this.scheduleForm = this.formBuilder.group({
      id: [null],
      day: ['', Validators.required],
      isMorningOff: [true],
      morningStart: [{value: '', disabled: true}],
      morningEnd: [{value: '', disabled: true}],
      isAfternoonOff: [true],
      afternoonStart: [{value: '', disabled: true}],
      afternoonEnd: [{value: '', disabled: true}]
    }, { validators: [scheduleInfoValidator] });
  }

  getFormControl(name: string) {
    return this.scheduleForm.get(name);
  }

  get isMorningInvalid(): boolean {
    const isTouched = this.getFormControl('morningStart')?.touched || this.getFormControl('morningEnd')?.touched;
    return this.scheduleForm.hasError('invalidMorning') && !!isTouched;
  }

  get isMorningValid(): boolean {
    const isOff = this.getFormControl('isMorningOff')?.value;
    if (isOff) return true;

    const start = this.getFormControl('morningStart');
    const end = this.getFormControl('morningEnd');
    const isTouchedAndDirty = (start?.touched && end?.touched) || (start?.dirty && end?.dirty);
    const hasValues = start?.value && end?.value;

    return !!isTouchedAndDirty && !!hasValues && !this.scheduleForm.hasError('invalidMorning');
  }

  get isAfternoonInvalid(): boolean {
    const isTouched = this.getFormControl('afternoonStart')?.touched || this.getFormControl('afternoonEnd')?.touched;
    return this.scheduleForm.hasError('invalidAfternoon') && !!isTouched;
  }

  get isAfternoonValid(): boolean {
    const isOff = this.getFormControl('isAfternoonOff')?.value;
    if (isOff) return true;

    const start = this.getFormControl('afternoonStart');
    const end = this.getFormControl('afternoonEnd');
    const isTouchedAndDirty = (start?.touched && end?.touched) || (start?.dirty && end?.dirty);
    const hasValues = start?.value && end?.value;

    return !!isTouchedAndDirty && !!hasValues && !this.scheduleForm.hasError('invalidAfternoon');
  }

  get hasOverlapError(): boolean {
    const mEnd = this.getFormControl('morningEnd')?.touched;
    const pStart = this.getFormControl('afternoonStart')?.touched;
    return this.scheduleForm.hasError('overlap') && (!!mEnd || !!pStart);
  }

  get hasNoScheduleError(): boolean {
    const mTouched = this.getFormControl('morningStart')?.touched || this.getFormControl('morningEnd')?.touched;
    const pTouched = this.getFormControl('afternoonStart')?.touched || this.getFormControl('afternoonEnd')?.touched;
    return this.scheduleForm.hasError('noSchedule') && (!!mTouched || !!pTouched);
  }

  handleDayClick(dayKey: string) {
    const schedule = this.operatorSchedules.find(s => s.day === dayKey);

    if (schedule) {
      this.openEditForm(schedule);
    } else {
      this.openCreateForm(dayKey);
    }
  }

  getLabelFromKey(key: string): string {
    return this.weekDays.find(d => d.key === key)?.label || key;
  }

  openEditForm(dto: StandardScheduleDto) {
    if (!this.selectedOperator) {
      alert("Seleziona un operatore dalla lista a sinistra prima di aggiungere un'eccezione.");
      return;
    }
    this.isFormOpen = true;
    this.isEditMode = true;

    this.scheduleForm.get('day')?.setValue(dto.day);
    this.scheduleForm.get('day')?.disable();

    this.scheduleForm.get('id')?.setValue(dto.id);

    if (dto.morningStart && dto.morningEnd) {
      this.scheduleForm.get('isMorningOff')?.setValue(false);
      this.scheduleForm.get('morningStart')?.setValue(dto.morningStart);
      this.scheduleForm.get('morningEnd')?.setValue(dto.morningEnd);
    }
    if (dto.afternoonStart && dto.afternoonEnd) {
      this.scheduleForm.get('isAfternoonOff')?.setValue(false);
      this.scheduleForm.get('afternoonStart')?.setValue(dto.afternoonStart);
      this.scheduleForm.get('afternoonEnd')?.setValue(dto.afternoonEnd);
    }

    this.cdr.detectChanges();
  }

  openCreateForm(dayKey?: string) {
    if (!this.selectedOperator) {
      alert("Seleziona un operatore dalla lista a sinistra prima di aggiungere un'eccezione.");
      return;
    }
    this.isEditMode = false
    this.isFormOpen = true;
    this.scheduleForm.reset({
      isMorningOff: true,
      isAfternoonOff: true,
      day: dayKey || ''
    });

    if(dayKey) this.scheduleForm.get('day')?.disable();
    else this.scheduleForm.get('day')?.enable();
  }

  closeForm() {
    this.isFormOpen = false;
    this.scheduleForm.reset();
  }

  onSubmit() {
    if(!this.scheduleForm.valid || this.isSaving) return

    this.isSaving = true;
    const formValue = this.scheduleForm.value;

    const scheduleData = {
      morningStart: formValue.isMorningOff ? undefined : formValue.morningStart,
      morningEnd: formValue.isMorningOff ? undefined : formValue.morningEnd,
      afternoonStart: formValue.isAfternoonOff ? undefined : formValue.afternoonStart,
      afternoonEnd: formValue.isAfternoonOff ? undefined : formValue.afternoonEnd,
      operatorId: this.selectedOperator!.id
    };

    if(this.isEditMode){
      const updateDto: UpdateStandardScheduleDto = {
        id: formValue.id,
        ...scheduleData
      }
      this.scheduleService.updateStandardSchedule(updateDto).subscribe({
        next: (updatedSchedule) => {
          this.operatorSchedules = this.operatorSchedules.map(
            s => s.id === updatedSchedule.id ? updatedSchedule : s
          )
          this.isSaving = false;
          this.closeForm()
          this.loadOperatorSchedule(this.selectedOperator!.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error updating tool:', err);
          this.cdr.detectChanges();
        }
      })
    } else {
      const createDto: CreateStandardScheduleDto = {
        day: formValue.day,
        ...scheduleData
      }
      console.log('Creating schedule with data', createDto);
      this.scheduleService.createStandardSchedule(createDto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm()
          this.loadOperatorSchedule(this.selectedOperator!.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error creating tool:', err);
          this.cdr.detectChanges();
        }
      })
    }
  }

  deleteSchedule(event: Event) {
    event.stopPropagation();
    if(!confirm('Sei sicuro di voler eliminare questo Turno?')) return;

    const standardScheduleId = this.scheduleForm.get('id')?.value;
    if(!standardScheduleId) return;

    this.isSaving = true;

    this.scheduleService.deleteStandardSchedule(standardScheduleId).subscribe({
      next: () => {
        this.operatorSchedules = this.operatorSchedules.filter(s => s.id !== standardScheduleId);
        this.closeForm()
        this.isSaving = false
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting standard schedule:', err);
        this.isSaving = false
        this.cdr.detectChanges();
      }
    })
  }

  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;
  protected readonly Refresh01Icon = Refresh01Icon;
  protected readonly DateTimeIcon = DateTimeIcon;
}
