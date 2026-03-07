"use client";

import * as React from "react";

import { Wallet, Info, Building } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function WalletCard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Individual Admin Wallets Deprecated</AlertTitle>
        <AlertDescription>
          Admin wallets have been centralized into a single platform wallet system. 
          Individual admin wallet balances are no longer maintained.
        </AlertDescription>
      </Alert>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Centralized Platform Wallet</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
            <Building className="text-muted-foreground size-5" />
            Platform Managed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              All platform earnings and transactions are now managed through a centralized wallet system.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your super admin for platform wallet access and transaction details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}