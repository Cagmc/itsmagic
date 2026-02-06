import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../services/client.service';
import { ClientViewModel } from '../models/client';

@Component({
  selector: 'app-clients-list',
  standalone: true,
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
      <div class="status" *ngIf="loading">Loading clients...</div>
      <div class="status error" *ngIf="error">{{ error }}</div>

      <table *ngIf="!loading && clients.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let client of clients">
            <td>#{{ client.id }}</td>
            <td>{{ client.name }}</td>
            <td>{{ client.email }}</td>
            <td class="actions">
              <a routerLink="/clients/{{ client.id }}">View</a>
              <a routerLink="/clients/{{ client.id }}/edit">Edit</a>
              <button type="button" (click)="deleteClient(client)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty" *ngIf="!loading && clients.length === 0">
        No clients found yet. Add the first one.
      </div>
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
export class ClientsListPage implements OnInit {
  clients: ClientViewModel[] = [];
  loading = false;
  error: string | null = null;

  constructor(private readonly clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.error = null;
    this.clientService.list().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load clients right now.';
        this.loading = false;
      }
    });
  }

  deleteClient(client: ClientViewModel): void {
    const confirmed = confirm(`Delete ${client.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    this.clientService.delete(client.id).subscribe({
      next: () => this.loadClients(),
      error: () => {
        this.error = 'Failed to delete the client.';
      }
    });
  }
}
