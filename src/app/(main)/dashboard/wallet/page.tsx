import { PlatformWalletPanel } from "../_components/wallet/platform-wallet-panel";

export default function WalletPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Platform earnings &amp; deductions from class settlements, plus full transaction history
        </p>
      </div>
      <PlatformWalletPanel />
    </div>
  );
}
