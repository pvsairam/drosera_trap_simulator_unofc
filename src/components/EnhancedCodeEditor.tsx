
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EnhancedCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  className?: string;
}

export function EnhancedCodeEditor({ 
  value, 
  onChange, 
  language, 
  height = "400px", 
  className 
}: EnhancedCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState(height);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = parseInt(height);
      const newHeight = Math.max(scrollHeight, minHeight);
      
      textareaRef.current.style.height = `${newHeight}px`;
      setDynamicHeight(`${newHeight}px`);
    }
  }, [value, height]);

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
    <div className={cn("relative", className)} style={{ height: dynamicHeight }}>
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
      
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-mono">
          {language}
        </div>
      </div>
    </div>
  );
}
