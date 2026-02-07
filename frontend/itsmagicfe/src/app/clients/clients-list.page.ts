import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../services/client.service';
import { ClientViewModel } from '../models/client';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-clients-list',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Client Directory</p>
        <h1>Clients</h1>
        <p class="subtle">Browse, manage, and update every client in the system.</p>
      </div>
      <a class="primary" routerLink="/clients/new">New Client</a>
    </section>

    <div class="card">
      @if(loading())
      {
        <div class="status">Loading clients...</div>
      }
      @if(error)
      {
        <div class="status error">{{ error }}</div>
      }

      @if(!loading() && clients.length > 0)
      {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          @for(client of clients; track client.id) {
            <tr>
              <td>#{{ client.id }}</td>
              <td>{{ client.name }}</td>
              <td>{{ client.email }}</td>
              <td class="actions">
                <a routerLink="/clients/{{ client.id }}">View</a>
                <a routerLink="/clients/{{ client.id }}/edit">Edit</a>
                <button type="button" (click)="deleteClient(client)">Delete</button>
              </td>
            </tr>
          }
          </tbody>
        </table>
      }

      @if(!loading() && clients.length === 0)
      {
        <div class="empty">
          No clients found yet. Add the first one.
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.75rem;
        gap: 1.5rem;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.75rem;
        color: #64748b;
        margin: 0 0 0.35rem;
      }

      h1 {
        margin: 0;
        font-size: 2.2rem;
      }

      .subtle {
        color: #64748b;
        margin: 0.5rem 0 0;
      }

      .primary {
        background: #2563eb;
        color: #ffffff;
        text-decoration: none;
        padding: 0.7rem 1.3rem;
        border-radius: 999px;
        font-weight: 600;
      }

      .card {
        background: #ffffff;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      .actions a,
      .actions button {
        font-size: 0.9rem;
        border: none;
        background: none;
        color: #2563eb;
        cursor: pointer;
        text-decoration: none;
        padding: 0;
      }

      .actions button {
        color: #dc2626;
      }

      .status {
        padding: 1rem 0;
        color: #475569;
      }

      .status.error {
        color: #b91c1c;
      }

      .empty {
        padding: 2rem 0.5rem;
        color: #64748b;
        text-align: center;
      }

      @media (max-width: 720px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .actions {
          justify-content: flex-start;
        }
      }
    `
  ]
})
export class ClientsListPage implements OnInit, OnDestroy {
  clients: ClientViewModel[] = [];
  loading = signal(false);
  error: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly clientService: ClientService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients(): void {
    this.loading.set(true);
    this.error = null;
    this.clientService.list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients) => {
          this.clients = clients;
          this.loading.set(false);
        },
        error: () => {
          this.error = 'Unable to load clients right now.';
          this.loading.set(false);
        }
      });
  }

  deleteClient(client: ClientViewModel): void {
    const confirmed = confirm(`Delete ${client.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    this.clientService.delete(client.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadClients(),
        error: () => {
          this.error = 'Failed to delete the client.';
        }
      });
  }
}
