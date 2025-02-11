export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_account_id?: string;
          // ... other fields
        };
      };
      invoices: {
        Row: {
          // ... invoice fields
        };
      };
      // ... other tables
    };
  };
} 