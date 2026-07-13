import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transaction-list/transaction-list').then((m) => m.TransactionList),
  },

  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./transaction-form/transaction-form').then((m) => m.TransactionForm),
  },

  {
    path: 'new',
    loadComponent: () =>
      import('./transaction-form/transaction-form').then((m) => m.TransactionForm),
  }
];


