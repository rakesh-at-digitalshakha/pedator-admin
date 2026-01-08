"use client";

import * as React from "react";

import { Wallet, ArrowDownToLine, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useWithdraw } from "@/hooks/api";
import { useAdminStore } from "@/stores/admin/admin-provider";

export function WalletCard() {
  const { user } = useAuth();
  const updateWallet = useAdminStore((state) => state.updateWallet);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const { mutate: withdraw, isPending } = useWithdraw();

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user || withdrawAmount > user.wallet) {
      toast.error("Insufficient balance");
      return;
    }

    withdraw(
      { amount: withdrawAmount },
      {
        onSuccess: () => {
          toast.success(`Successfully withdrew $${withdrawAmount}`);
          updateWallet(user.wallet - withdrawAmount);
          setIsDialogOpen(false);
          setAmount("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Withdrawal failed");
        },
      },
    );
  };

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
    <div className="grid gap-4 @xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Balance</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Wallet className="text-muted-foreground size-5" />${user.wallet.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <ArrowDownToLine className="mr-2 size-4" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleWithdraw}>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>Enter the amount you want to withdraw from your wallet.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={user.wallet}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <p className="text-muted-foreground text-sm">
                        Available balance: ${user.wallet.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Processing..." : "Withdraw"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Your main wallet balance</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Real Wallet</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Plus className="text-muted-foreground size-5" />${user.realWallet.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Finalized</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Finalized transactions</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Virtual Wallet</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Minus className="text-muted-foreground size-5" />${user.virtualWallet.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">Pending</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Pending/accepted transactions</div>
        </CardFooter>
      </Card>
    </div>
  );
}
