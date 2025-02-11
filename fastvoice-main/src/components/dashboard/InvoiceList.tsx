
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>
          View your generated invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Client</th>
                <th className="text-left py-2 px-4">Amount</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{invoice.client_name}</td>
                  <td className="py-2 px-4">${(invoice.amount / 100).toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-sm",
                      invoice.status === "paid" ? "bg-green-100 text-green-800" :
                      invoice.status === "open" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
