import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Category } from '../../../core/models/category.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  amountValidator,
  expenseDateValidator,
} from '../../../core/validators/transaction.validators';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class TransactionForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  form!: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  editId: number | null = null;
  isLoading = false;
  isFetchingData = true;
  isSubmitted = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
    this.checkEditMode();
  }

  private buildForm(): void {
    this.form = this.fb.group(
      {
        type: ['', Validators.required],
        amount: ['', [Validators.required, amountValidator]],
        categoryId: ['', Validators.required],
        date: ['', Validators.required],
        description: ['', Validators.required],
        receiptUrl: [''],
      },
      {
        validators: expenseDateValidator,
      },
    );
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.editId = Number(id);
      this.loadTransaction(this.editId);
    } else {
      this.isFetchingData = false;
    }
  }

  private loadTransaction(id: number): void {
    this.transactionService.getById(id).subscribe({
      next: (transaction) => {
        this.form.patchValue({
          type: transaction.type,
          amount: transaction.amount,
          categoryId: Number(transaction.categoryId),
          date: transaction.date,
          description: transaction.description,
          receiptUrl: transaction.receiptUrl,
        });
        this.isFetchingData = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('loadTransaction error:', err);
        this.isFetchingData = false;
        this.cdr.detectChanges();
        this.router.navigate(['/transactions']);
      },
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const storedUser = this.authService.getCurrentUser();
    const formValue = this.form.value;

    const date =
      formValue.date instanceof Date
        ? formValue.date.toISOString().split('T')[0]
        : formValue.date;

    const payload = {
      ...formValue,
      date,
      userId: storedUser?.id ?? 1,
      categoryId: Number(formValue.categoryId),
    };

    const request$ =
      this.isEditMode && this.editId
        ? this.transactionService.update(this.editId, payload)
        : this.transactionService.create(payload);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/transactions']);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }

  get f() {
    return this.form.controls;
  }
}
