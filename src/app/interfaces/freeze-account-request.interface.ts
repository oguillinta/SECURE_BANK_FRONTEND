export interface FreezeAccountRequest {
  accountNumber: string;
  action: string;
  freezeType: string;
  reason: string;
  authorizedBy: string;
  comments: string;
  reviewDate: Date;
}
