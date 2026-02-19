import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {noOnlySpacesValidator} from '../../../validators/no-only-space-validator';
import {ToolService} from '../../../service/tool-service';
import {CreateToolDto, ToolDto} from '../../../model/tool-dto';

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
export class ToolsPage implements OnInit{

  protected tools: ToolDto[] = [];

  isFormOpen = false;
  isEditMode = false;
  isLoading = false;

  constructor(
    private toolService: ToolService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm()
  }


  toolForm!: FormGroup;

  ngOnInit(): void {
    this.loadTools()
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
    this.cdr.detectChanges()

    this.toolService.getAllTools().subscribe({
      next: (data) => {
        this.tools = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tools:', err);
        alert('Errore durante il caricamento degli strumenti. Riprova più tardi.');
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
    if(!this.toolForm.valid) return

    const formValue = this.toolForm.value;

    if(this.isEditMode){
      const updateDto = {
        id: formValue.id,
        name: formValue.name,
        availability: formValue.availability
      }
      this.toolService.updateTool(updateDto).subscribe({
        next: () => {
          // this.refreshListAfterChange(); todo vedere se serve
          this.closeForm()
        },
        error: (err) => { console.error('Error updating tool:', err); }
      })
    } else {
      const createDto: CreateToolDto = {
        name: formValue.name,
        availability: formValue.availability
      }
      this.toolService.createTool(createDto).subscribe({
        next: (newTool) => {
          this.tools = [...this.tools, newTool];
          this.closeForm()
        },
        error: (err) => { console.error('Error creating tool:', err); }
      })
    }
  }

  deleteTool(event: Event) {

  }

  closeForm() {
    this.isFormOpen = false;
    this.toolForm.reset();
  }
}
