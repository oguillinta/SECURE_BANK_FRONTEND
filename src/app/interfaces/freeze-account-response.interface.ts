export interface FreezeAccountResponse {
  accountNumber: string;
  previousStatus: string;
  currentStatus: string;
  freezeReferenceNumber: string;
  actionTimestamp: Date;
  freezeType: string;
  authorizedBy: string;
  nextReviewDate: string;
  message: string;
}
