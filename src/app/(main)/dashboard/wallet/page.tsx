import { WalletCard } from "../_components/wallet/wallet-card";
import { TransactionsTable } from "../_components/wallet/transactions-table";

export default function WalletPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet and view transaction history</p>
      </div>
      <WalletCard />
      <TransactionsTable />
    </div>
  );
}
