import { auth } from "@/auth";
import LandingClient from "./landing-client";

export const metadata = {
  title: "DynaOne | Premium POS & ERP Platform for Growing Businesses",
  description:
    "Manage sales, inventory, purchases, payments, accounting, and multi-branch operations from one powerful, unified POS & ERP platform. Inspired by the best SaaS systems.",
  keywords: [
    "POS",
    "ERP",
    "Point of Sale",
    "Inventory Management",
    "Retail",
    "Pharmacy Software",
    "Multi-branch POS",
    "Accounting Software",
  ],
  authors: [{ name: "DynaOne Systems Inc." }],
};

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return <LandingClient isLoggedIn={isLoggedIn} />;
}
