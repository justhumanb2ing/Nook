import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Settings2Icon } from "lucide-react";

export function SettingDropdownMenu() {
  return (
    <DropdownMenu dir="ltr">
      <DropdownMenuTrigger asChild>
        <Button size={"icon-sm"} variant={"ghost"} className="rounded-full text-muted-foreground">
          <Settings2Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl p-2 space-y-1"
        align="start"
        sideOffset={8}
        side="top"
      >
        <DropdownMenuItem className="text-xs flex-col items-start gap-1">
          <p>Change Handle</p>
          <p className="text-muted-foreground">real handle</p>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs flex-col items-start gap-1">
          <p>Change visibility</p>
          <p className="text-muted-foreground">visible</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
