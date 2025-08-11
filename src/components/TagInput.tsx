import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  allTags: string[];
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, allTags, placeholder, className }: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleUnselect(value[value.length - 1]);
    }
  };

  const filteredTags = allTags.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 min-h-[40px] items-center">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-md">
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => handleUnselect(tag)}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Add tags..."}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm font-sans"
        />
      </div>
      {inputValue && filteredTags.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <Command>
              <CommandList>
                <CommandGroup heading="Suggestions">
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => {
                        onChange([...value, tag]);
                        setInputValue("");
                      }}
                      className="cursor-pointer"
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}