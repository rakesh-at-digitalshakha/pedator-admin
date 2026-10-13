"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PayoutsTable from "./table";
import SettlementsPanel from "./settlements-panel";

export default function PayoutsHub() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payouts &amp; settlements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Settle completed classes into mentor Available balance, then approve mentor bank withdrawals.
        </p>
      </div>

      <Tabs defaultValue="settlements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settlements">Class settlements</TabsTrigger>
          <TabsTrigger value="withdrawals">Mentor withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="settlements">
          <SettlementsPanel />
        </TabsContent>
        <TabsContent value="withdrawals">
          <PayoutsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
