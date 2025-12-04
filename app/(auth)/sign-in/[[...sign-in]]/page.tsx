import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { siteConfig } from "@/config/metadata-config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Daydream to manage your profile and links.",
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/sign-in`,
    title: "Sign in",
    description: "Sign in to Daydream to manage your profile and links.",
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign in",
    description: "Sign in to Daydream to manage your profile and links.",
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
  alternates: {
    canonical: `${siteConfig.url}/sign-in`,
    languages: {
      "ko-KR": `${siteConfig.url}/sign-in`,
      "en-US": `${siteConfig.url}/sign-in`,
    },
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
