import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { siteConfig } from "@/config/metadata-config";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Daydream account and publish your profile in minutes.",
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/sign-up`,
    title: "Sign up",
    description:
      "Create your Daydream account and publish your profile in minutes.",
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign up",
    description:
      "Create your Daydream account and publish your profile in minutes.",
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
  alternates: {
    canonical: `${siteConfig.url}/sign-up`,
    languages: {
      "ko-KR": `${siteConfig.url}/sign-up`,
      "en-US": `${siteConfig.url}/sign-up`,
    },
  },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
