'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface RefundFormProps {
  onSubmit: (customerId: string, orderId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export default function RefundForm({ onSubmit, loading = false }: RefundFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !orderId || !reason) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(customerId, orderId, reason);
    } finally {
      setSubmitting(false);
      setCustomerId('');
      setOrderId('');
      setReason('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full border-2 border-accent/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b">
          <CardTitle className="text-xl">Submit Refund Request</CardTitle>
          <CardDescription>Provide your details and our AI agent will process your request</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Customer ID */}
              <div className="space-y-2">
                <Label htmlFor="customer-id" className="font-semibold">Customer ID</Label>
                <Input
                  id="customer-id"
                  type="text"
                  placeholder="e.g., CUST001"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                  disabled={submitting || loading}
                  className="border-slate-200 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">Found in your account settings</p>
              </div>

              {/* Order ID */}
              <div className="space-y-2">
                <Label htmlFor="order-id" className="font-semibold">Order ID</Label>
                <Input
                  id="order-id"
                  type="text"
                  placeholder="e.g., ORD001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  disabled={submitting || loading}
                  className="border-slate-200 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">From your order confirmation</p>
              </div>
            </div>

            {/* Reason for Refund */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-semibold">Reason for Refund</Label>
              <Select value={reason} onValueChange={setReason} disabled={submitting || loading}>
                <SelectTrigger id="reason" className="border-slate-200">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective or Broken</SelectItem>
                  <SelectItem value="damaged_in_shipping">Damaged in Shipping</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                  <SelectItem value="not_as_described">Not as Described</SelectItem>
                  <SelectItem value="changed_mind">Changed My Mind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || loading || !customerId || !orderId || !reason}
              size="lg"
              className="w-full font-semibold"
            >
              {submitting || loading ? (
                <>
                  <Clock className="size-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Refund Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Policy Information */}
      <Alert className="border-l-4 border-l-green-500 bg-green-50 dark:bg-slate-900 text-foreground">
        <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
        <AlertDescription className="ml-3">
          <span className="font-bold block mb-2 text-green-900 dark:text-green-200">Refund Policy</span>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
            <li>✓ Refunds available within 30 days of purchase</li>
            <li>✓ Loyal customers ($5,000+ spent) get 45-day window</li>
            <li>✓ Processing takes 3-5 business days</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
