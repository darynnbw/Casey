import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const themes = [
  { name: "Pastel Blue", value: "light" },
  { name: "Pastel Yellow", value: "yellow" },
  { name: "Pastel Green", value: "green" },
  { name: "Pastel Pink", value: "pink" },
  { name: "Pastel Purple", value: "purple" },
  { name: "Pastel Orange", value: "orange" },
];

export function ThemeSelector() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-lg">
              <Palette className="h-4 w-4" />
              <span className="sr-only">Select Theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="rounded-lg">
          <p>Change Theme</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="rounded-xl">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            className="cursor-pointer rounded-md"
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}