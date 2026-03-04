import {Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OperatorsService } from '../../../service/operators-service';
import { OperatorDto, CreateOperatorDto, UpdateOperatorDto } from '../../../model/operator-dto';
import {Add01Icon, Cancel01Icon, Refresh01Icon} from '@hugeicons/core-free-icons';
import {ServiceService} from '../../../service/service-service';
import {ServiceDto} from '../../../model/service-dto';
import {CreateOperatorServiceDto, UpdateOperatorServiceDto} from '../../../model/operator-service-dto';

@Component({
  selector: 'app-operators-page',
  standalone: false,
  templateUrl: './operators-page.html',
  styleUrls: [
    './operators-page.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/typography.css'
  ],
})
export class OperatorsPage implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  operatorForm!: FormGroup;
  searchControl = new FormControl('');

  selectedImageFile: File | undefined = undefined;

  allOperators: OperatorDto[] = [];
  services: ServiceDto[] = [];
  filteredOperators: OperatorDto[] = [];

  isFormOpen = false;
  isEditMode = false;
  isLoading = false;
  isLoadingServices = false;
  isSaving = false;

  private destroy$ = new Subject<void>();
  protected readonly Refresh01Icon = Refresh01Icon;

  constructor(
    private formBuilder: FormBuilder,
    private operatorsService: OperatorsService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadData();
    this.loadAllServices()
    this.setupSearchAndDataStream();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.operatorForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10}$')]],
      operatorServices: [[]]
    });
  }

  private loadData() {
    this.isLoading = true;
    this.operatorsService.loadAllOperators().subscribe({
      error: (err) => {
        console.error('Errore caricamento', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadAllServices() {
    this.isLoadingServices = true;

    this.serviceService.loadAllServices().subscribe({
      next: (servicesResponse: ServiceDto[]) => {
        this.services = servicesResponse;
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingServices = false;
        console.error('Failed to load services', err);
        this.cdr.detectChanges();
      }
    });
  }

  isServiceSelected(serviceId: string): boolean {
    const selected: any[] = this.operatorForm.value.operatorServices || [];
    return selected.some(s => s.serviceId === serviceId);
  }

  getServiceDuration(serviceId: string): number {
    const selected: any[] = this.operatorForm.value.operatorServices || [];
    const found = selected.find(s => s.serviceId === serviceId);
    return found ? found.duration : 30; // 30 è il default visivo iniziale
  }

  onServiceToggle(serviceId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentServices: any[] = this.operatorForm.value.operatorServices || [];

    let newServices;
    if (isChecked) {
      newServices = [...currentServices, { serviceId: serviceId, duration: 30 }];
    } else {
      newServices = currentServices.filter(s => s.serviceId !== serviceId);
    }

    this.operatorForm.patchValue({ operatorServices: newServices });
  }

  onDurationChange(serviceId: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newDuration = parseInt(inputElement.value, 10) || 0; // Evita NaN se l'utente svuota il campo

    const currentServices: any[] = this.operatorForm.value.operatorServices || [];

    // Creiamo un nuovo array aggiornando solo l'oggetto interessato
    const newServices = currentServices.map(s => {
      if (s.serviceId === serviceId) {
        return { ...s, duration: newDuration };
      }
      return s;
    });

    this.operatorForm.patchValue({ operatorServices: newServices });
  }

  forceRefreshList() {
    this.isLoading = true;
    this.operatorsService.refreshCache().subscribe({
      error: (err) => {
        console.error('Errore refresh', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setupSearchAndDataStream() {
    combineLatest([
      this.operatorsService.operators$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ])
      .pipe(
        takeUntil(this.destroy$),
        map(([operators, searchTerm]) => {
          this.allOperators = operators;

          if (!searchTerm || searchTerm.trim() === '') {
            return operators;
          }

          const term = searchTerm.toLowerCase();
          return operators.filter(op =>
            op.name.toLowerCase().includes(term) ||
            op.surname.toLowerCase().includes(term)
          );
        })
      )
      .subscribe({
        next: (filteredList) => {
          this.filteredOperators = filteredList;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }

  openCreateForm() {
    this.isEditMode = false;
    this.operatorForm.reset();
    this.selectedImageFile = undefined;
    this.isFormOpen = true;
  }

  openEditForm(operator: OperatorDto) {
    this.isEditMode = true;
    this.selectedImageFile = undefined;

    const servicesForForm = operator.operatorServices?.map(s => ({
      serviceId: s.serviceId,
      duration: s.duration || 30
    })) || [];

    this.operatorForm.patchValue({
      id: operator.id,
      name: operator.name,
      surname: operator.surname,
      phoneNumber: operator.phoneNumber,
      operatorServices: servicesForForm
    });
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
    this.operatorForm.reset();
    this.selectedImageFile = undefined;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getFormControl(controlName: string) {
    return this.operatorForm.get(controlName);
  }

  onSubmit() {
    if (this.operatorForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const formValue = this.operatorForm.value;

    if (this.isEditMode) {
      const mappedUpdateServices: UpdateOperatorServiceDto[] = (formValue.operatorServices || []).map((s: any) => ({
        operatorId: formValue.id,
        serviceId: s.serviceId,
        duration: s.duration || 30
      }));

      const updateDto: UpdateOperatorDto = {
        id: formValue.id,
        name: formValue.name,
        surname: formValue.surname,
        phoneNumber: formValue.phoneNumber,
        operatorServices: mappedUpdateServices
      };

      this.operatorsService.updateOperator(updateDto, this.selectedImageFile).subscribe({
        next: () => {
          this.closeForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const mappedCreateServices: CreateOperatorServiceDto[] = (formValue.operatorServices || []).map((s: any) => ({
        serviceId: s.serviceId,
        duration: s.duration || 30
      }));

      const createDto: CreateOperatorDto = {
        name: formValue.name,
        surname: formValue.surname,
        phoneNumber: formValue.phoneNumber,
        operatorServices: mappedCreateServices
      };

      this.operatorsService.createOperator(createDto, this.selectedImageFile).subscribe({
        next: () => {
          this.closeForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteOperator(event: Event) {
    event.preventDefault();

    const id = this.operatorForm.get('id')?.value;
    if (!id || !confirm('Sei sicuro di voler eliminare questo operatore?')) return;

    this.isSaving = true;
    this.operatorsService.deleteOperator(id).subscribe({
      next: () => {
        this.closeForm();
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;
}
