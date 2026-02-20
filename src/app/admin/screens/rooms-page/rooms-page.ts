import {Add01Icon, Cancel01Icon, Door01Icon, Refresh01Icon} from '@hugeicons/core-free-icons';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ServiceDto} from '../../../model/service-dto';
import {RoomDto} from '../../../model/room-dto';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {RoomService} from '../../../service/room-service';
import {noOnlySpacesValidator} from '../../../validators/no-only-space-validator';
import {ServiceService} from '../../../service/service-service';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-rooms-page',
  standalone: false,
  templateUrl: './rooms-page.html',
  styleUrls: [
    './rooms-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class RoomsPage implements OnInit, OnDestroy{
  protected services: ServiceDto[] = [];
  protected rooms: RoomDto[] = [];
  protected searchedRooms: RoomDto[] = [];

  searchControl!: FormControl;
  roomForm!: FormGroup;

  isFormOpen = false;
  isEditMode = false;

  isLoading = false;
  isLoadingRooms = false;
  isLoadingServices = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchControl = this.formBuilder.control('')
    this.initForm()
  }

  ngOnInit(): void {
    this.loadAllRooms()
    this.loadAllServices()
    this.setupSearchAndDataStream()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.roomForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), noOnlySpacesValidator()]],
      selectedServiceIds: [[]]
    })
  }

  forceRefreshList() {
    this.isLoading = true;
    this.roomService.refreshCache().subscribe({
      error: (err) => {
        console.error('Errore refresh', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm() {
    this.isFormOpen = true;
    this.isEditMode = false;
    this.roomForm.reset();
    this.roomForm.patchValue({ selectedServiceIds: [] })
  }

  openEditForm(room: RoomDto) {
    this.isFormOpen = true;
    this.isEditMode = true;
    this.roomForm.patchValue({
      id: room.id,
      name: room.name,
      selectedServiceIds: room.services.map(s => s.id)
    })
  }

  closeForm() {
    this.isFormOpen = false;
    this.roomForm.reset();
  }

  loadAllRooms(){
    if(this.isLoadingRooms) return;
    this.isLoadingRooms = true;

    this.roomService.loadAllRooms().subscribe({
      next: () => {
        this.isLoadingRooms = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingRooms = false;
        console.error('Failed to load rooms', err);
        this.cdr.detectChanges();
      }
    })
  }

  loadAllServices() {
    if(this.isLoadingServices) return;
    this.isLoadingServices = true;

    this.serviceService.loadAllServices().subscribe({
      next: () => {
        this.isLoadingServices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingServices = false;
        console.error('Failed to load services', err);
        this.cdr.detectChanges();
      }
    })
  }

  getFormControl(controlName: string) {
    return this.roomForm.get(controlName);
  }

  private setupSearchAndDataStream() {
    combineLatest([
      this.roomService.rooms$,
      this.serviceService.services$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$),
      map(([rooms, services, search]) => {
        this.rooms = rooms;
        this.services = services;

        const value = search?.toLowerCase() || '';
        return rooms.filter(room =>
          room.name.toLowerCase().includes(value));
      })
    ).subscribe({
      next: filteredRooms =>  {
        this.searchedRooms = filteredRooms;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
  }

  onSubmit() {
    if(!this.roomForm.valid || this.isSaving) return;

    this.isSaving = true;
    const formValue = this.roomForm.value;

    const dto = {
      id: formValue.id,
      name: formValue.name,
      services: formValue.selectedServiceIds
    }

    if(this.isEditMode) {
      this.roomService.updateRoom(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm()
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert("Errore durante l'aggiornamento della stanza. Riprova.")
          console.error('Failed to update room', err)
          this.cdr.detectChanges();
        }
      })
    } else {
      this.roomService.createRoom(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm()
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert("Errore durante la creazione della stanza. Riprova.")
          console.error('Failed to create room', err)
          this.cdr.detectChanges();
        }
      })
    }
  }

  deleteRoom(event: Event) {
    event.stopPropagation();
    if(!confirm('Sei sicuro di voler eliminare questa stanza?')) return;

    const roomId = this.roomForm.get('id')?.value;
    if(!roomId) return;

    this.isSaving = true;

    this.roomService.deleteRoom(roomId).subscribe({
      next: () => {
        this.closeForm()
        this.isSaving = false
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting room:', err);
        this.isSaving = false
        this.cdr.detectChanges();
      }
    })
  }

  isServiceSelected(serviceId: string) {
    return this.roomForm.value.selectedServiceIds.includes(serviceId);
  }

  onServiceToggle(serviceId: string, event: Event) {
    const selectedServiceIds: string[] = this.roomForm.value.selectedServiceIds;

    if((event.target as HTMLInputElement).checked) {
      this.roomForm.patchValue({ selectedServiceIds: [...selectedServiceIds, serviceId] });
    } else {
      this.roomForm.patchValue({ selectedServiceIds: selectedServiceIds.filter((id: string) => id !== serviceId) });
    }
  }

  protected readonly Door01Icon = Door01Icon;
  protected readonly Cancel01Icon = Cancel01Icon;
  protected readonly Add01Icon = Add01Icon;
  protected readonly Refresh01Icon = Refresh01Icon;
}
