export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
}

export type NewTransaction = Omit<Transaction, 'id'>;
