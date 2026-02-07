import {Component, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../services/client.service';
import { ClientViewModel } from '../models/client';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Client Profile</p>
        <h1>{{ client?.name || 'Client' }}</h1>
        <p class="subtle">Full client record and quick actions.</p>
      </div>
      <a class="ghost" routerLink="/clients">Back to Clients</a>
    </section>

    @if (loading()) {
      <div class="card">Loading client...</div>
    }
    @if (error) {
      <div class="card error">{{ error }}</div>
    }

    @if(client){
      <div class="card">
        <div class="row">
          <span>Client ID</span>
          <strong>#{{ client.id }}</strong>
        </div>
        <div class="row">
          <span>Name</span>
          <strong>{{ client.name }}</strong>
        </div>
        <div class="row">
          <span>Email</span>
          <strong>{{ client.email }}</strong>
        </div>

        <div class="actions">
          <a class="primary" routerLink="/clients/{{ client.id }}/edit">Edit Client</a>
          <button type="button" (click)="deleteClient()">Delete Client</button>
        </div>
      </div>
    }
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
        font-size: 2rem;
      }

      .subtle {
        color: #64748b;
        margin: 0.5rem 0 0;
      }

      .ghost {
        text-decoration: none;
        color: #2563eb;
        font-weight: 600;
      }

      .card {
        background: #ffffff;
        border-radius: 20px;
        padding: 1.75rem;
        display: grid;
        gap: 1.25rem;
        max-width: 560px;
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
      }

      .row {
        display: flex;
        justify-content: space-between;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        color: #1e293b;
      }

      .row span {
        color: #64748b;
      }

      .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .primary {
        background: #2563eb;
        color: #ffffff;
        text-decoration: none;
        padding: 0.75rem 1.6rem;
        border-radius: 999px;
        font-weight: 600;
      }

      button {
        background: #fee2e2;
        color: #b91c1c;
        border: none;
        border-radius: 999px;
        padding: 0.75rem 1.6rem;
        font-weight: 600;
        cursor: pointer;
      }

      .error {
        color: #b91c1c;
      }

      @media (max-width: 720px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class ClientDetailPage implements OnInit {
  client: ClientViewModel | null = null;
  clientId = 0;
  loading = signal(true);
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly clientService: ClientService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(parsedId)) {
      this.error = 'Invalid client id.';
      this.loading.set(false);
      return;
    }
    this.clientId = parsedId;
    this.clientService.getById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.loading.set(false);
      },
      error: () => {
        this.error = 'Unable to load the client.';
        this.loading.set(false);
      }
    });
  }

  deleteClient(): void {
    if (!this.client) {
      return;
    }
    const confirmed = confirm(`Delete ${this.client.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    this.clientService.delete(this.clientId).subscribe({
      next: () => this.router.navigate(['/clients']),
      error: () => {
        this.error = 'Failed to delete the client.';
      }
    });
  }
}
