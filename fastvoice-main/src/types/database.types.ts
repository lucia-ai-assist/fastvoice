export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      // ... other tables
    };
  };
} 