export interface CreateAccountResponse {
  accountNumber: string;
  customerId: string;
  accountType: string;
  balance: number;
  dailyTransactionLimit: number;
  status: string;
  createdAt: Date;
}
