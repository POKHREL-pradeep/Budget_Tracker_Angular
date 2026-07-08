import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { Transaction, NewTransaction } from '../models/transaction.model';

const API_URL = 'http://localhost:3000/transactions';

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);

  getAll(filters?: TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();

    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters?.startDate) {
      params = params.set('date_gte', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('date_lte', filters.endDate);
    }

    return this.http.get<Transaction[]>(API_URL, { params });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${API_URL}/${id}`);
  }

  create(transaction: NewTransaction): Observable<Transaction> {
    return this.http.post<Transaction>(API_URL, transaction);
  }

  update(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${API_URL}/${id}`, transaction);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  deleteMany(ids: number[]): Observable<void[]> {
    // json-server has no native bulk-delete endpoint, so we fire
    // multiple DELETE requests and combine them into one Observable
    const requests = ids.map((id) => this.delete(id));
    return forkJoin(requests);
  }
}
