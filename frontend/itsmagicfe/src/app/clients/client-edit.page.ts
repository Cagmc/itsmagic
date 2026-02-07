import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../services/client.service';
import { ClientViewModel } from '../models/client';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Client Profile</p>
        <h1>Edit Client</h1>
        @if(client){
            <p class="subtle">Update details for {{ client.name }}.</p>
        }
      </div>
      <a class="ghost" routerLink="/clients">Back to Clients</a>
    </section>

    @if(loading()){
      <div class="card">Loading client...</div>
    }
    @if(error){
      <div class="card error">{{ error }}</div>
    }

    @if(!loading() && !error){
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Name
          <input type="text" formControlName="name" />
        </label>
        @if(form.controls.name.touched && form.controls.name.invalid){
          <div class="error">
            Name is required.
          </div>
        }

        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        @if(form.controls.email.touched && form.controls.email.invalid){
          <div class="error">
            Enter a valid email.
          </div>
        }

        <div class="actions">
          <button type="submit" [disabled]="form.invalid || saving()">Save Changes</button>
          <a class="ghost" routerLink="/clients/{{ clientId }}">Cancel</a>
        </div>
        @if(saveError){
          <div class="status error">{{ saveError }}</div>
        }
      </form>
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
        gap: 1rem;
        max-width: 560px;
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 600;
        color: #1e293b;
      }

      input {
        padding: 0.7rem 0.9rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        font-size: 1rem;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      button {
        background: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 999px;
        padding: 0.75rem 1.6rem;
        font-weight: 600;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .error {
        color: #b91c1c;
        font-size: 0.85rem;
      }

      .status {
        margin-top: 0.5rem;
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
export class ClientEditPage implements OnInit {
  client: ClientViewModel | null = null;
  clientId = 0;
  loading = signal(true);
  saving = signal(false);
  error: string | null = null;
  saveError: string | null = null;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

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
        this.form.setValue({
          name: client.name,
          email: client.email
        });
        this.loading.set(false);
      },
      error: () => {
        this.error = 'Unable to load the client.';
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError = null;
    this.clientService.update(this.clientId, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/clients', this.clientId]);
      },
      error: () => {
        this.saving.set(false);
        this.saveError = 'Failed to update the client.';
      }
    });
  }
}
