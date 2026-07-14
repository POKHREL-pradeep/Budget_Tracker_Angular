import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const amountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = Number(control.value);

  if (control.value === null) {
    return null;
  }

  if (isNaN(value)) {
    return { invalidAmount: 'Amount must be a number' };
  }
  else if (value <= 0) {
    return { invalidAmount: 'Amount must be greater than 0' };
  }
  else if (value > 1_000_000) {
    return { invalidAmount: 'Amount cannot exceed 1,000,000' };
  }

  return null;
};

export const expenseDateValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const type = group.get('type')?.value;
  const date = group.get('date')?.value;


  if (!type || !date) return null;

  if (type === 'expense') {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('comparing:', selectedDate, '>', today, '=', selectedDate > today);


    if (selectedDate > today) {
      return { futureExpenseDate: 'Expense date cannot be in the future' };
    }
  }

  return null;
};
