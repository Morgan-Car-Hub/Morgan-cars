declare module '@paystack/inline-js' {
  export interface PaystackSuccessResponse {
    reference?: string;
    trxref?: string;
    trans?: string;
    transaction?: string;
    status?: string;
    message?: string;
    redirecturl?: string;
  }

  export interface PaystackLoadResponse {
    id?: string;
    accessCode?: string;
    customer?: Record<string, unknown>;
  }

  export interface PaystackErrorResponse {
    status?: boolean;
    message?: string;
    type?: string;
  }

  export interface PaystackResumeCallbacks {
    onSuccess?: (transaction: PaystackSuccessResponse) => void;
    onCancel?: () => void;
    onLoad?: (data: PaystackLoadResponse) => void;
    onError?: (error: PaystackErrorResponse) => void;
  }

  export interface PaystackNewTransactionParams extends PaystackResumeCallbacks {
    key?: string;
    email?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    accessCode?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    channels?: string[];
    metadata?: Record<string, unknown>;
    onBankTransferConfirmationPending?: () => void;
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: PaystackResumeCallbacks): unknown;
    newTransaction(params: PaystackNewTransactionParams): unknown;
    cancelTransaction(id?: string): void;
  }
}
