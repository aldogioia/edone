import { Injectable } from '@angular/core';
import {Environment} from '../utils/Enviroment';
import {BehaviorSubject, tap} from 'rxjs';
import {CreateRoomDto, RoomDto, UpdateRoomDto} from '../model/room-dto';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private baseUrl: string = Environment.getInstance().apiUrl + 'room';

  private roomsSubject = new BehaviorSubject<RoomDto[]>([]);
  public rooms$ = this.roomsSubject.asObservable();

  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadAllRooms(forceRefresh: boolean = false) {
    if(this.hasLoaded && !forceRefresh)
      return this.rooms$

    return this.http.get<RoomDto[]>(this.baseUrl + "/all").pipe(
      tap(rooms => {
        this.hasLoaded = true;
        this.roomsSubject.next(rooms);
      })
    )
  }

  createRoom(dto: CreateRoomDto) {
    return this.http.post<RoomDto>(this.baseUrl, dto).pipe(
      tap(newRoom => {
        const currentRooms = this.roomsSubject.getValue()
        this.roomsSubject.next([...currentRooms, newRoom])
      })
    );
  }

  updateRoom(dto: UpdateRoomDto) {
    return this.http.put<RoomDto>(this.baseUrl, dto).pipe(
      tap((res: RoomDto) => {
        const currentRooms = this.roomsSubject.getValue()
        const index = currentRooms.findIndex(room => room.id === res.id)
        if(index !== -1) {
          currentRooms[index] = res
          this.roomsSubject.next([...currentRooms])
        }
      })
    )
  }

  deleteRoom(roomId: string) {
    return this.http.delete(this.baseUrl, {
      params: { roomId }
    }).pipe(
      tap(() => {
        const currentRooms = this.roomsSubject.getValue()
        const updatedRooms = currentRooms.filter(room => room.id !== roomId)
        this.roomsSubject.next(updatedRooms)
      })
    )
  }
}
