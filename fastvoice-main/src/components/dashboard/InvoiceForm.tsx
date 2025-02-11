
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { generateInvoice } from "@/api/generate-invoice";
import { useToast } from "@/hooks/use-toast";
import { InvoiceFormData } from "@/types/invoice";

interface InvoiceFormProps {
  onInvoiceGenerated: () => void;
}

export function InvoiceForm({ onInvoiceGenerated }: InvoiceFormProps) {
  const [generating, setGenerating] = useState(false);
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_name: "",
    client_email: "",
    amount: "",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      await generateInvoice({
        ...formData,
        amount: Math.round(parseFloat(formData.amount) * 100),
        due_date: date.toISOString(),
      });

      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });

      setFormData({
        client_name: "",
        client_email: "",
        amount: "",
        description: "",
      });
      setDate(undefined);
      onInvoiceGenerated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Generate Invoice</CardTitle>
        <CardDescription>
          Create a new invoice for your client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                name="client_email"
                type="email"
                value={formData.client_email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" disabled={generating}>
            {generating ? "Generating..." : "Generate Invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
