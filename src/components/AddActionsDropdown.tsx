import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, MessageSquarePlus, Camera, CheckCircle2, BookOpenText, Lightbulb, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AddActionsDropdownProps {
  onAddNote: () => void;
  onAddScreenshot: () => void;
  onAddDecision: () => void;
  onAddJournalEntry: () => void;
  onAddProblemSolution: () => void;
}

export function AddActionsDropdown({
  onAddNote,
  onAddScreenshot,
  onAddDecision,
  onAddJournalEntry,
  onAddProblemSolution,
}: AddActionsDropdownProps) {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const actions = [
    {
      label: "Add Note",
      icon: MessageSquarePlus,
      onClick: onAddNote,
    },
    {
      label: "Add Screenshot",
      icon: Camera,
      onClick: onAddScreenshot,
    },
    {
      label: "Add Decision",
      icon: CheckCircle2,
      onClick: onAddDecision,
    },
    {
      label: "Add Journal Entry",
      icon: BookOpenText,
      onClick: onAddJournalEntry,
    },
    {
      label: "Add Problem/Solution",
      icon: Lightbulb,
      onClick: onAddProblemSolution,
    },
  ];

  const renderMenuItems = (closeMenu?: () => void) => (
    <>
      {actions.map((action) => (
        <DropdownMenuItem
          key={action.label}
          onClick={() => {
            action.onClick();
            closeMenu?.();
          }}
          className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-md hover:bg-accent"
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </DropdownMenuItem>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="default" size="icon" className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add New</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-xl">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Item</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 grid gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-start py-2 px-3 rounded-lg"
                onClick={() => {
                  action.onClick();
                  setIsDrawerOpen(false);
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="rounded-lg px-4 py-2.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow w-56">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="rounded-lg">
          <p>Add a new note, screenshot, decision, or journal entry</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="w-56 rounded-xl p-2 shadow-lg">
        {renderMenuItems(() => {})} {/* Pass a dummy close function for DropdownMenu */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}