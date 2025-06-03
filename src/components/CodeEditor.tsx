
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  className?: string;
}

export function CodeEditor({ value, onChange, language, height = "300px", className }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-full resize-none border-0 bg-slate-950 text-green-400 p-4 font-mono text-sm",
          "focus:outline-none focus:ring-0",
          "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        )}
        placeholder="// Write your Solidity trap code here..."
        spellCheck={false}
        style={{
          minHeight: height,
          fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
          lineHeight: "1.5",
          tabSize: 4,
        }}
      />
      
      {/* Syntax highlighting overlay would go here in a real implementation */}
      <div className="absolute top-2 right-2">
        <div className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-mono">
          {language}
        </div>
      </div>
    </div>
  );
}
