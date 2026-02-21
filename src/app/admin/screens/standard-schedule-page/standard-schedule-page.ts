import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {OperatorsService} from '../../../service/operators-service';
import {map} from 'rxjs/operators';
import {OperatorDto} from '../../../model/operator-dto';
import {Add01Icon, Cancel01Icon, Refresh01Icon} from '@hugeicons/core-free-icons';
import {CreateStandardScheduleDto, StandardScheduleDto, UpdateStandardScheduleDto} from '../../../model/schedule-dto';
import {ScheduleService} from '../../../service/schedule-service';
import {Shift} from '../../../model/shift';
import {ScheduleValidators} from '../../../validators/schedule-validators';

@Component({
  selector: 'app-standard-schedule-page',
  standalone: false,
  templateUrl: './standard-schedule-page.html',
  styleUrls: [
    './standard-schedule-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
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
    this.loadAllOperators()
    this.setupDataStream()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectOperator(operator: OperatorDto) {
    this.selectedOperator = operator;
    this.loadOperatorSchedule(operator.id);
    console.log('Selected operator', operator);
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
        type: "AM"
      });
    }

    if (schedule.afternoonStart && schedule.afternoonEnd) {
      shifts.push({
        id: schedule.id + 1,
        start: schedule.afternoonStart,
        end: schedule.afternoonEnd,
        type: "PM"
      });
    }

    return shifts;
  }


  getDaysWithoutShifts() {
    return this.weekDays.filter(day =>
      !this.operatorSchedules.some(schedule => schedule.day === day.key)
    );
  }

  loadAllOperators() {
    if(this.isLoadingOperators) return;
    this.isLoadingOperators = true;

    this.operatorService.loadAllOperators().subscribe({
      next: () => {
        this.isLoadingOperators = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingOperators = false;
        console.error('Failed to load operators', err);
        this.cdr.detectChanges();
      }
    })
  }

  loadOperatorSchedule(operatorId: string) {
    if(this.isLoadingSchedules) return;
    this.isLoadingSchedules = true;

    this.scheduleService.getOperatorStandardSchedule(operatorId).subscribe({
      next: (schedules) => {
        this.operatorSchedules = schedules;
        this.isLoadingSchedules = false;
        console.log('Loaded operator schedule', schedules);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingSchedules = false;
        console.error('Failed to load operator schedule', err);
        this.cdr.detectChanges();
      }
    })
  }

  private setupDataStream() {
    combineLatest([
      this.operatorService.operators$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([operators]) => {
        this.operators = operators
        if(operators.length > 0){
          this.selectedOperator = operators[0]
          this.loadOperatorSchedule(this.selectedOperator!.id)
        }
      })
    ).subscribe({
      next: () => { this.cdr.detectChanges() }
    })
  }

  initForm() {
    this.scheduleForm = this.formBuilder.group({
      id: [null],
      day: ['', Validators.required],
      slots: this.formBuilder.array([], [ScheduleValidators.amPmOverlap()])
    });
  }


  get slots() {
    return this.scheduleForm.get('slots') as FormArray;
  }

  getAvailableSlotTypes() {
    const currentTypes = this.slots.value.map((s: any) => s.type);
    return {
      hasAM: currentTypes.includes('AM'),
      hasPM: currentTypes.includes('PM')
    };
  }

  addSlot(type: 'AM' | 'PM') {
    const slotGroup = this.formBuilder.group({
      type: [type],
      start: [null, [Validators.required, ScheduleValidators.step30Min()]],
      end: [null, [Validators.required, ScheduleValidators.step30Min()]]
    }, {
      validators: [ScheduleValidators.timeRange()]
    });

    this.slots.push(slotGroup);
    this.slots.controls.sort((a, b) => a.get('type')?.value === 'AM' ? -1 : 1);
    this.cdr.detectChanges();
  }

  removeSlot(index: number) {
    this.slots.removeAt(index);
    this.cdr.detectChanges();
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
    this.isFormOpen = true;
    this.isEditMode = true;
    this.slots.clear();

    this.scheduleForm.get('day')?.setValue(dto.day);
    this.scheduleForm.get('day')?.disable();

    this.scheduleForm.get('id')?.setValue(dto.id);

    if (dto.morningStart && dto.morningEnd) {
      this.addSlotWithData('AM', dto.morningStart, dto.morningEnd);
    }
    if (dto.afternoonStart && dto.afternoonEnd) {
      this.addSlotWithData('PM', dto.afternoonStart, dto.afternoonEnd);
    }

    this.cdr.detectChanges();
  }

  openCreateForm(dayKey?: string) {
    this.isFormOpen = true;
    this.isEditMode = false;
    this.slots.clear();
    this.scheduleForm.get('day')?.enable();

    this.scheduleForm.reset({
      day: dayKey || ''
    });
  }

  private addSlotWithData(type: 'AM' | 'PM', start: string, end: string) {
    const slotGroup = this.formBuilder.group({
      type: [type],
      start: [start.substring(0, 5), [Validators.required, ScheduleValidators.step30Min()]],
      end: [end.substring(0, 5), [Validators.required, ScheduleValidators.step30Min()]]
    }, {
      validators: [ScheduleValidators.timeRange()]
    });
    this.slots.push(slotGroup);
  }

  closeForm() {
    this.isFormOpen = false;
    this.scheduleForm.reset();
  }

  onSubmit() {
    if(!this.scheduleForm.valid || this.isSaving) return

    this.isSaving = true;
    const formValue = this.scheduleForm.value;
    const slots = formValue.slots as any[];

    const amSlot = slots.find(s => s.type === 'AM');
    const pmSlot = slots.find(s => s.type === 'PM');

    const scheduleData = {
      morningStart: amSlot ? amSlot.start : null,
      morningEnd: amSlot ? amSlot.end : null,
      afternoonStart: pmSlot ? pmSlot.start : null,
      afternoonEnd: pmSlot ? pmSlot.end : null,
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Errore durante l\'aggiornamento del Turno. ' + err);
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
        next: (newSchedules) => {
          this.operatorSchedules.push(newSchedules);
          this.isSaving = false;
          this.closeForm()
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Errore durante la creazione del macchinario. Verifica che il nome non sia già in uso e riprova.');
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
}
