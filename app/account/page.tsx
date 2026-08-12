import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session.user) redirect("/login?next=%2Faccount");
  if (!session.profile) notFound();
  return (
    <section className="bg-cream-gradient min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
          Your account
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest-950">👤 Profile</h1>
        <div className="mt-8">
          <AccountForm initial={session.profile} />
        </div>
      </div>
    </section>
  );
}