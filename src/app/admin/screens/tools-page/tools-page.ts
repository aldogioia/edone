import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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
  protected searchedTools: ToolDto[] = [];

  toolForm!: FormGroup;
  searchControl!: FormControl;

  isFormOpen = false;
  isEditMode = false;
  isLoading = false;

  constructor(
    private toolService: ToolService,
    private formBuilder: FormBuilder,
  ) {
    this.searchControl = this.formBuilder.control('')
    this.initForm()
  }

  ngOnInit(): void {
    this.loadTools()

    this.searchControl.valueChanges.subscribe(search => {
      const value = search?.toLowerCase() || '';

      this.searchedTools = this.tools.filter(tool =>
        tool.name.toLowerCase().includes(value));
    });
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

    this.toolService.getTools().subscribe({
      next: (tools) => {
        this.tools = tools;
        this.searchedTools = tools;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tools:', err);
        this.isLoading = false;
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
          // this.refreshListAfterChange(); todo vedere se serve
          this.isLoading = false;
          this.closeForm()
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating tool:', err);
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
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error creating tool:', err);
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
      },
      error: (err) => {
        console.error('Error deleting tool:', err);
        this.isLoading = false
      }
    })
  }

  closeForm() {
    this.isFormOpen = false;
    this.toolForm.reset();
  }
}
