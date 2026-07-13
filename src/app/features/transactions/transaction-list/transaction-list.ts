import { Component, OnInit, ViewChild, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize, forkJoin, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { TranslocoModule } from '@jsverse/transloco';
@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TranslocoModule,
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionList implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['date', 'description', 'category', 'type', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Transaction>([]);
  categories: Category[] = [];
  isLoading = true;

  // Filter controls
  typeFilter = new FormControl('');
  categoryFilter = new FormControl('');

  ngOnInit(): void {
    this.setupFilters();
  }

  private setupFilters(): void {
    this.dataSource.filterPredicate = (data: Transaction) => {
      const typeMatch = !this.typeFilter.value || data.type === this.typeFilter.value;
      const categoryMatch =
        !this.categoryFilter.value || data.categoryId === Number(this.categoryFilter.value);
      return typeMatch && categoryMatch;
    };

    merge(this.typeFilter.valueChanges, this.categoryFilter.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dataSource.filter = String(Date.now());
      });
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((c) => Number(c.id) === Number(categoryId))?.name ?? 'Unknown';
  }

  navigateToNew(): void {
    this.router.navigate(['/transactions/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/transactions/edit', id]);
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    forkJoin({
      transactions: this.transactionService.getAll(),
      categories: this.categoryService.getAll(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ transactions, categories }) => {
          this.categories = categories;
          this.dataSource.data = transactions;
        },
        error: (err) => {
          console.error('loadData error:', err);
        },
      });
  }
}
