import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'clients'
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./clients/clients-list.page').then((m) => m.ClientsListPage)
  },
  {
    path: 'clients/new',
    loadComponent: () =>
      import('./clients/client-create.page').then((m) => m.ClientCreatePage)
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () =>
      import('./clients/client-edit.page').then((m) => m.ClientEditPage)
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./clients/client-detail.page').then((m) => m.ClientDetailPage)
  },
  {
    path: '**',
    redirectTo: 'clients'
  }
];
