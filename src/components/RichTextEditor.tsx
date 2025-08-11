import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS for styling
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'], // Basic formatting
    [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Lists
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ id, value, onChange, placeholder, className }) => {
  return (
    <div className={cn(
      "rounded-lg border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-primary transition-colors overflow-hidden",
      className
    )}>
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};