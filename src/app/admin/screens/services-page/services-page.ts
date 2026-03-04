import {Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Add01Icon, Cancel01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';

import { ServiceService } from '../../../service/service-service';
import { ToolService } from '../../../service/tool-service';
import { ServiceDto, CreateServiceDto, UpdateServiceDto } from '../../../model/service-dto';
import {ToolDto} from '../../../model/tool-dto';
import {noOnlySpacesValidator} from '../../../validators/no-only-space-validator';

@Component({
  selector: 'app-services-page',
  standalone: false,
  templateUrl: './services-page.html',
  styleUrls: [
    './services-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class ServicesPage implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected services: ServiceDto[] = [];
  protected searchedServices: ServiceDto[] = [];
  protected tools: ToolDto[] = [];

  serviceForm!: FormGroup;
  searchControl: FormControl = new FormControl('');
  selectedImageFile: File | undefined = undefined;

  isFormOpen = false;
  isEditMode = false;
  isLoadingService = false;
  isLoadingTools = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  protected readonly Refresh01Icon = Refresh01Icon;
  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;

  constructor(
    private formBuilder: FormBuilder,
    private serviceService: ServiceService,
    private toolService: ToolService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadAllServices();
    this.loadAllTools();
    this.setupSearchAndDataStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.serviceForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, noOnlySpacesValidator(), Validators.minLength(1), Validators.maxLength(50)]],
      price: [1, [Validators.required, Validators.min(1)]],
      persistenceDuration: [null, [Validators.required]],
      multiOperator: [false, [Validators.required]],
      selectedToolIds: [[]]
    });
  }

  loadAllServices() {
    if (this.isLoadingService) return;
    this.isLoadingService = true;

    this.serviceService.loadAllServices().subscribe({
      next: () => {
        this.isLoadingService = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento servizi', err);
        this.isLoadingService = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllTools() {
    if (this.isLoadingTools) return;
    this.isLoadingTools = true;

    this.toolService.loadAllTools().subscribe({
      next: () => {
        this.isLoadingTools = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento macchinari', err);
        this.isLoadingTools = false;
        this.cdr.detectChanges();
      }
    });
  }

  forceRefreshList() {
    this.isLoadingService = true;
    this.serviceService.refreshCache().subscribe({
      next: () => {
        this.isLoadingService = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore refresh servizi', err);
        this.isLoadingService = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setupSearchAndDataStream() {
    combineLatest([
      this.serviceService.services$,
      this.toolService.tools$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$),
      map(([services, tools, search]) => {
        this.services = services;
        this.tools = tools;

        const value = search?.toLowerCase() || '';
        return services.filter(service =>
          service.name.toLowerCase().includes(value));
      })
    ).subscribe({
      next: filteredServices => {
        this.searchedServices = filteredServices;
        this.isLoadingService = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFormControl(controlName: string) {
    return this.serviceForm.get(controlName);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }

  openCreateForm() {
    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedImageFile = undefined;
    this.serviceForm.reset({ price: 1, selectedToolIds: [] });
  }

  openEditForm(service: ServiceDto) {
    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedImageFile = undefined;

    const toolIds = service.tools ? service.tools.map(t => t.id) : [];

    this.serviceForm.patchValue({
      id: service.id,
      name: service.name,
      price: service.price,
      multiOperator: service.multiOperator,
      persistenceDuration: service.persistenceDuration,
      selectedToolIds: toolIds
    });
  }

  closeForm() {
    this.isFormOpen = false;
    this.serviceForm.reset();
    this.selectedImageFile = undefined;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  isToolSelected(toolId: string) {
    return this.serviceForm.value.selectedToolIds?.includes(toolId);
  }

  onToolToggle(toolId: string, event: Event) {
    const selectedIds: string[] = this.serviceForm.value.selectedToolIds || [];

    if ((event.target as HTMLInputElement).checked) {
      this.serviceForm.patchValue({ selectedToolIds: [...selectedIds, toolId] });
    } else {
      this.serviceForm.patchValue({ selectedToolIds: selectedIds.filter(id => id !== toolId) });
    }
  }

  onSubmit() {
    if (this.serviceForm.invalid || this.isSaving) return;

    if (!this.isEditMode && !this.selectedImageFile) {
      alert("L'immagine è obbligatoria per creare un nuovo servizio.");
      return;
    }

    this.isSaving = true;
    const formValue = this.serviceForm.value;

    if (this.isEditMode) {
      const updateDto: UpdateServiceDto = {
        id: formValue.id,
        name: formValue.name,
        price: formValue.price,
        tools: formValue.selectedToolIds,
        multiOperator: formValue.multiOperator,
        persistenceDuration: formValue.persistenceDuration
      };

      this.serviceService.updateService(updateDto, this.selectedImageFile).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      const createDto: CreateServiceDto = {
        name: formValue.name,
        price: formValue.price,
        tools: formValue.selectedToolIds,
        multiOperator: formValue.multiOperator,
        persistenceDuration: formValue.persistenceDuration
      };



      this.serviceService.createService(createDto, this.selectedImageFile!).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteService(event: Event) {
    event.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return;

    const id = this.serviceForm.get('id')?.value;
    if (!id) return;

    this.isSaving = true;

    this.serviceService.deleteService(id).subscribe({
      next: () => {
        this.closeForm();
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore eliminazione:', err);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
