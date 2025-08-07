import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS for styling

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
    [{ 'background': ['#FDFD96', '#77DD77', '#AEC6CF', '#FFB6C1'] }], // Pastel highlight colors
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'background', // Include 'background' for highlighting
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ id, value, onChange, placeholder, className }) => {
  return (
    <div className={className}>
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="rounded-md border border-input/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      />
    </div>
  );
};