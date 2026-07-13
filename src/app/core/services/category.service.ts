import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Category } from '../models/category.model';

const API_URL = 'http://localhost:3000/categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL).pipe(shareReplay(1));
  }
}
