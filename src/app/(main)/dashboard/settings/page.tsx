"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { usePlatformSettings, usePaymentGatewaySettings, useMaintenanceMode } from "@/hooks/api/use-settings";

export default function SettingsPage() {
  const { query: settings, update: updateSettings } = usePlatformSettings();
  const { query: payment, update: updatePayment } = usePaymentGatewaySettings();
  const maintenance = useMaintenanceMode();

  const form = useForm<{ name: string; primaryColor: string }>();
  const paymentForm = useForm<{ provider: string }>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => updateSettings.mutate(values))} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required", minLength: { value: 3, message: "Min 3 characters" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Edutech" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryColor"
                rules={{ pattern: { value: /^#([0-9a-f]{3}){1,2}$/i, message: "Enter hex color e.g. #2563eb" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color (hex)</FormLabel>
                    <FormControl>
                      <Input placeholder="#2563eb" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit((values) => updatePayment.mutate(values))} className="grid gap-4">
              <FormField
                control={paymentForm.control}
                name="provider"
                rules={{ required: "Provider is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Select a provider --</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit">Save Payment Settings</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => maintenance.mutate({ enabled: true })}>Enable</Button>
            <Button variant="outline" onClick={() => maintenance.mutate({ enabled: false })}>
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
