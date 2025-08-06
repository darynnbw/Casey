import React from 'react';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface GradientSeparatorProps {
  className?: string;
}

const GradientSeparator: React.FC<GradientSeparatorProps> = ({ className }) => {
  return (
    <Separator 
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-border to-transparent",
        className
      )} 
    />
  );
};

export default GradientSeparator;