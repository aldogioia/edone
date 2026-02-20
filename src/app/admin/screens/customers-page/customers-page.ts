import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { tap } from 'rxjs';
import {CustomersService} from '../../../service/customers-service';
import {
  CustomerDto,
  UpdateCustomerDto,
  CreateCustomerWithoutPasswordDto
} from '../../../model/customer-dto';
import {Add01Icon, Cancel01Icon, UserIcon} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-customers-page',
  standalone: false,
  templateUrl: './customers-page.html',
  styleUrls: [
    './customers-page.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/typography.css'
  ],
})
export class CustomersPage implements OnInit {
  customerForm!: FormGroup;
  searchControl = new FormControl('');

  customers: CustomerDto[] = [];

  currentPage = 0;
  pageSize = 10;
  isLastPage = false;

  isFormOpen = false;
  isEditMode = false;
  isLoading = false;
  isSearching = false;



  constructor(
    private formBuilder: FormBuilder,
    private customersService: CustomersService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCustomers();

    this.setupSearchListener();
  }

  private initForm() {
    this.customerForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
    });
  }

  loadCustomers(reset: boolean = false) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    if (reset) {
      this.currentPage = 0;
      this.customers = [];
      this.isLastPage = false;
      this.searchControl.setValue('', { emitEvent: false });
      this.isSearching = false;
    }

    this.customersService.getCustomersPage(this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          if (reset) {
            this.customers = page.content;
          } else {
            this.customers = [...this.customers, ...page.content];
          }

          this.isLastPage = page.number >= page.totalPages - 1;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Errore caricamento', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadMore() {
    if (!this.isLastPage && !this.isSearching) {
      this.currentPage++;
      this.loadCustomers(false);
    }
  }

  private setupSearchListener() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.customers = [];
        this.cdr.detectChanges();
      }),
      switchMap((query) => {
        if (!query || query.trim() === '') {
          this.isSearching = false;
          this.currentPage = 0; // Reset pagina

          return this.customersService.getCustomersPage(0, this.pageSize).pipe(
            map(page => {
              this.isLastPage = page.number >= page.totalPages - 1;
              return page.content;
            })
          );
        }

        else {
          this.isSearching = true;
          return this.customersService.searchCustomers(query);
        }
      })
    ).subscribe({
      next: (results) => {
        this.customers = results;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm() {
    this.isEditMode = false;
    this.customerForm.reset();
    this.isFormOpen = true;
  }

  openEditForm(customer: CustomerDto) {
    this.isEditMode = true;

    this.customerForm.patchValue({
      id: customer.id,
      name: customer.name,
      surname: customer.surname,
      phoneNumber: customer.phoneNumber
    });
    this.isFormOpen = true;
  }

  onSubmit() {
    if (this.customerForm.invalid) return;

    const formValue = this.customerForm.value;

    if (this.isEditMode) {
      const updateDto: UpdateCustomerDto = {
        id: formValue.id,
        name: formValue.name,
        surname: formValue.surname,
        phoneNumber: formValue.phoneNumber
      };

      this.customersService.updateCustomer(updateDto).subscribe({
        next: () => {
          this.refreshListAfterChange();
          this.closeForm();
        },
        error: (err) => console.error('Errore update', err)
      });

    } else {
      const createDto: CreateCustomerWithoutPasswordDto = {
        name: formValue.name,
        surname: formValue.surname,
        phoneNumber: formValue.phoneNumber
      };

      this.customersService.createCustomer(createDto).subscribe({
        next: (newCustomer) => {
          this.customers = [newCustomer, ...this.customers];
          this.closeForm();
        },
        error: (err) => console.error('Errore creazione', err)
      });
    }
  }

  deleteCustomer(event: Event) {
    event.stopPropagation();

    if(!confirm('Sei sicuro di voler eliminare questo utente?')) return;

    const id = this.customerForm.get('id')?.value;
    if (!id) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.customersService.deleteCustomer(id).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.id !== id);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore eliminazione', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeForm() {
    this.isFormOpen = false;
    this.customerForm.reset();
  }

  private refreshListAfterChange() {
    if (this.isSearching) {
      const query = this.searchControl.value;
      if(query) this.customersService.searchCustomers(query).subscribe(res => this.customers = res);
    } else {
      this.loadCustomers(true);
    }
  }

  protected readonly UserIcon = UserIcon;
  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;
}
