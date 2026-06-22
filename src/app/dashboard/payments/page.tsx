import React from "react";
import { Coins } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black">Payments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage incoming and outgoing payments.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px]">
        <Coins className="h-16 w-16 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground mb-2">Payments Module</h2>
        <p className="max-w-md text-sm">
          This section is currently under development. You will soon be able to fully manage your payments here with our new premium interface.
        </p>
      </div>
    </div>
  );
}
