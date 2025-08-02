export interface AccountSummary {
  accountNumber: string;
  customerId: string;
  accountType: string;
  balance: number;
  getDailyTransactionLimit: number;
  status: string;
  createdAt: String;
  updatedAt: String;
}
