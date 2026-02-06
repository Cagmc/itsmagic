import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientCreateDTO, ClientUpdateDTO, ClientViewModel } from '../models/client';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/clients';

  list(): Observable<ClientViewModel[]> {
    return this.http.get<ClientViewModel[]>(this.baseUrl);
  }

  getById(clientId: number): Observable<ClientViewModel> {
    return this.http.get<ClientViewModel>(`${this.baseUrl}/${clientId}`);
  }

  create(dto: ClientCreateDTO): Observable<ClientViewModel> {
    return this.http.post<ClientViewModel>(this.baseUrl, dto);
  }

  update(clientId: number, dto: ClientUpdateDTO): Observable<ClientViewModel> {
    return this.http.put<ClientViewModel>(`${this.baseUrl}/${clientId}`, dto);
  }

  delete(clientId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${clientId}`);
  }
}
