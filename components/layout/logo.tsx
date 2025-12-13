import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Logo({
  className,
}: {
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
  return (
    <div className={cn("size-20", className)}>
      <Image
        src={"/logo.png"}
        alt="logo"
        width={300}
        height={300}
        className="object-cover w-full h-full scale-150"
        unoptimized
      />
    </div>
  );
}
