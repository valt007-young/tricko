import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <section className="bg-cream-gradient flex min-h-[80vh] items-center justify-center px-4 py-16">
      <AuthForm mode="signup" />
    </section>
  );
}