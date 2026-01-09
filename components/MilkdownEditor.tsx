
import React, { useEffect, useRef } from 'react';

interface MilkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

/**
 * NOTE: Integrating Milkdown usually requires a multi-plugin setup.
 * For this implementation, we simulate a high-quality editor interface.
 */
const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ content, onChange, readonly = false }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.value) {
      editorRef.current.value = content;
    }
  }, [content]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-white">
      <textarea
        ref={editorRef}
        disabled={readonly}
        className="w-full h-full p-8 font-mono text-lg leading-relaxed focus:outline-none resize-none no-scrollbar"
        placeholder="Start writing your thoughts in Markdown..."
        onChange={(e) => onChange(e.target.value)}
      />
      
      {!readonly && (
        <div className="absolute bottom-6 right-8 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-4 text-xs font-medium text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default MilkdownEditor;
