import {Component, inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {noOnlySpacesValidator} from '../../../validators/no-only-space-validator';
import {ToolService} from '../../../service/tool-service';

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
export class ToolsPage {
  constructor(private toolService: ToolService) {}

  private formBuilder = inject(FormBuilder);

  createToolForm = this.formBuilder.group({
    name: ['', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      noOnlySpacesValidator()
    ]],
    availability: [1, [
      Validators.required,
      Validators.min(1)
    ]]
  })

  isFormOpen = false;

  checkToolNameError() {
    return this.createToolForm.get('name')?.invalid && this.createToolForm.get('name')?.touched
  }

  checkToolAvailabilityError() {
    return this.createToolForm.get('availability')?.invalid && this.createToolForm.get('availability')?.touched
  }

  createTool() {
    if(this.createToolForm.valid) {
      this.toolService.createTool(this.createToolForm.value.name!, this.createToolForm.value.availability!).subscribe({
          next: () => {
            this.isFormOpen = false;
            this.createToolForm.reset();
            alert('Tool creato con successo!');
          },
          error: (err) => {
            console.error('Error creating tool:', err);
            alert('Errore durante la creazione dello strumento. Riprova più tardi.');
          }
      })
    } else {
      this.createToolForm.markAllAsTouched();
    }
  }

  items = [
    {id: '1', name: 'Hammer', availability: 10},
    {id: '2', name: 'Screwdriver', availability: 10},
    {id: '3', name: 'Screwdriver', availability: 10},
    {id: '4', name: 'Screwdriver', availability: 10},
    {id: '5', name: 'Screwdriver', availability: 10},
    {id: '6', name: 'Screwdriver', availability: 10},
    {id: '7', name: 'Screwdriver', availability: 10},
    {id: '8', name: 'Screwdriver', availability: 10},
    {id: '9', name: 'Screwdriver', availability: 10}
  ]
}
