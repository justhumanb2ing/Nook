"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="w-full h-dvh flex flex-col justify-center items-center max-w-3xl mx-auto px-8">
      <div className="size-96 h-48 rounded-full overflow-hidden">
        <Image
          src={"/not-found.png"}
          alt="There's no data."
          width={200}
          height={200}
          className="object-cover w-full h-full grayscale"
          unoptimized
        />
      </div>
      <section>
        <h1 className="font-serif text-[6rem] lg:text-[6rem] leading-[0.8] font-normal text-stone-900 tracking-tighter -ml-2 mb-6 lg:mb-10 select-none">
          404
        </h1>
        <div className="relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl leading-[1.2] mb-8 font-light italic text-stone-600">
            &quot;Not gone,
            <br />
            merely undiscovered.&quot;
          </h2>

          <div className="space-y-6 text-stone-500 font-light text-base md:text-lg leading-relaxed max-w-md">
            <p>
              The page you seek has drifted away into the ether, or perhaps
              belongs to a season that has passed.
            </p>
            <p>
              Getting lost is a quiet part of the journey, but the familiar path
              is always waiting for your return.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button className="bg-brand-indigo hover:bg-brand-indigo-hover">
              <Link href="/">Return Home</Link>
            </Button>

            <Button variant={"ghost"} onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
