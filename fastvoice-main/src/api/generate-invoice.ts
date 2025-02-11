
import { supabase } from "@/integrations/supabase/client";
import type { CreateInvoiceParams } from "@/types/invoice";

export async function generateInvoice(params: CreateInvoiceParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('generate-invoice', {
      body: params,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    throw new Error(error.message);
  }
}
