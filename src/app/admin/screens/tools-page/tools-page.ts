import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {noOnlySpacesValidator} from '../../../validators/no-only-space-validator';
import {ToolService} from '../../../service/tool-service';
import {CreateToolDto, ToolDto} from '../../../model/tool-dto';
import {Subject, combineLatest, takeUntil} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-tools-page',
  standalone: false,
  templateUrl: './tools-page.html',
  styleUrls: [
    './tools-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class ToolsPage implements OnInit, OnDestroy{
  protected tools: ToolDto[] = [];
  protected searchedTools: ToolDto[] = [];

  toolForm!: FormGroup;
  searchControl: FormControl = new FormControl('');

  isFormOpen = false;
  isEditMode = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private toolService: ToolService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm()
  }

  ngOnInit(): void {
    this.loadTools()
    this.setupSearchAndDataStream()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchAndDataStream() {
    combineLatest([
      this.toolService.tools$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$),
      map(([tools, search]) => {
        this.tools = tools;
        const value = search?.toLowerCase() || '';
        return tools.filter(tool =>
          tool.name.toLowerCase().includes(value));
      })
    ).subscribe({
      next: filteredTools =>  {
        this.searchedTools = filteredTools;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
  }

  private initForm() {
    this.toolForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), noOnlySpacesValidator()]],
      availability: [1, [Validators.required, Validators.min(1)]]
    })
  }

  loadTools() {
    if(this.isLoading) return;
    this.isLoading = true;

    this.toolService.loadAllTools().subscribe({
      error: (err) => {
        console.error('Error loading tools:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
  }

  openCreateForm() {
    this.isFormOpen = true;
    this.isEditMode = false;

    this.toolForm.get('availability')?.setValidators([
      Validators.required,
      Validators.min(1)
    ]);

    this.toolForm.get('availability')?.updateValueAndValidity();

    this.toolForm.reset({ availability: 1 });
  }

  openEditForm(tool: ToolDto) {
    this.isFormOpen = true;
    this.isEditMode = true;

    this.toolForm.get('availability')?.setValidators([
      Validators.required,
      Validators.min(0)
    ]);

    this.toolForm.get('availability')?.updateValueAndValidity();

    this.toolForm.patchValue({
      id: tool.id,
      name: tool.name,
      availability: tool.availability
    });
  }

  checkToolNameError() {
    return this.toolForm.get('name')?.invalid && this.toolForm.get('name')?.touched
  }

  checkToolAvailabilityError() {
    return this.toolForm.get('availability')?.invalid && this.toolForm.get('availability')?.touched
  }

  onSubmit() {
    if(!this.toolForm.valid || this.isLoading) return

    this.isLoading = true;
    const formValue = this.toolForm.value;

    if(this.isEditMode){
      const updateDto = {
        id: formValue.id,
        name: formValue.name,
        availability: formValue.availability
      }
      this.toolService.updateTool(updateDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeForm()
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          alert('Errore durante l\'aggiornamento del macchinario. Verifica che il nome non sia già in uso e riprova.');
          console.error('Error updating tool:', err);
          this.cdr.detectChanges();
        }
      })
    } else {
      const createDto: CreateToolDto = {
        name: formValue.name,
        availability: formValue.availability
      }
      this.toolService.createTool(createDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeForm()
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          alert('Errore durante la creazione del macchinario. Verifica che il nome non sia già in uso e riprova.');
          console.error('Error creating tool:', err);
          this.cdr.detectChanges();
        }
      })
    }
  }

  deleteTool(event: Event) {
    event.stopPropagation();

    if(!confirm('Sei sicuro di voler eliminare questo macchinario?')) return;

    const toolId = this.toolForm.get('id')?.value;
    if(!toolId) return;

    this.isLoading = true;

    this.toolService.deleteTool(toolId).subscribe({
      next: () => {
        this.closeForm()
        this.isLoading = false
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting tool:', err);
        this.isLoading = false
        this.cdr.detectChanges();
      }
    })
  }

  closeForm() {
    this.isFormOpen = false;
    this.toolForm.reset();
  }
}
