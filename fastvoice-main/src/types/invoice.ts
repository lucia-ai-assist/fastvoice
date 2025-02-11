
export interface Invoice {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  client_name: string;
  client_email: string;
  amount: number;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceParams {
  client_name: string;
  client_email: string;
  amount: number;
  description: string;
  due_date: string;
}

export interface InvoiceFormData {
  client_name: string;
  client_email: string;
  amount: string;
  description: string;
}
