import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Heading1, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 5,
  className,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = '', placeholderText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText = '';
    if (selectedText) {
      newText = prefix + selectedText + suffix;
    } else {
      newText = prefix + placeholderText + suffix;
    }

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);

    // Manually update the value and trigger onChange
    const event = {
      target: { value: newValue, name: textarea.name },
      currentTarget: { value: newValue, name: textarea.name },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);

    // Restore cursor position
    const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : placeholderText.length);
    requestAnimationFrame(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    });
  };

  const applyListFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText = '';
    if (selectedText) {
      newText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
    } else {
      newText = '- List item';
    }

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);

    const event = {
      target: { value: newValue, name: textarea.name },
      currentTarget: { value: newValue, name: textarea.name },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);

    const newCursorPos = start + newText.length;
    requestAnimationFrame(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    });
  };

  const applyHeadingFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText = '';
    if (selectedText) {
      newText = `# ${selectedText}`;
    } else {
      newText = '# Heading';
    }

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);

    const event = {
      target: { value: newValue, name: textarea.name },
      currentTarget: { value: newValue, name: textarea.name },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);

    const newCursorPos = start + newText.length;
    requestAnimationFrame(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 p-1 border rounded-md bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormatting('**', '**', 'bold text')}
          className="h-8 w-8"
        >
          <Bold className="h-4 w-4" />
          <span className="sr-only">Bold</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormatting('*', '*', 'italic text')}
          className="h-8 w-8"
        >
          <Italic className="h-4 w-4" />
          <span className="sr-only">Italic</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={applyListFormatting}
          className="h-8 w-8"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">List</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={applyHeadingFormatting}
          className="h-8 w-8"
        >
          <Heading1 className="h-4 w-4" />
          <span className="sr-only">Heading</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormatting('`', '`', 'code')}
          className="h-8 w-8"
        >
          <Code className="h-4 w-4" />
          <span className="sr-only">Code</span>
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={cn("rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
        {...props}
      />
    </div>
  );
};