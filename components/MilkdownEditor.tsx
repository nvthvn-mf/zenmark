import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MilkdownEditorProps {
    content: string;
    onChange: (value: string) => void;
    readonly?: boolean;
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ content, onChange, readonly = false }) => {
    return (
        <div className="flex flex-1 h-full overflow-hidden bg-white">
            {/* ZONE GAUCHE : ÉDITEUR DE CODE (Masquée si readonly) */}
            {!readonly && (
                <div className="w-1/2 h-full border-r border-slate-200 flex flex-col bg-slate-50">
                    <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Markdown Source
                    </div>
                    <textarea
                        className="flex-1 w-full h-full p-6 font-mono text-sm leading-relaxed text-slate-800 bg-transparent resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="# Commencez à écrire ici..."
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            )}

            {/* ZONE DROITE : APERÇU (Pleine largeur si readonly) */}
            <div className={`${readonly ? 'w-full max-w-4xl mx-auto' : 'w-1/2'} h-full flex flex-col bg-white`}>
                {!readonly && (
                    <div className="px-4 py-2 bg-white border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Preview</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">
              {content.split(/\s+/).filter(Boolean).length} words
            </span>
                    </div>
                )}

                {/* Zone de rendu Markdown */}
                <div className="flex-1 overflow-y-auto p-8 custom-prose">
                    <article className="prose prose-slate prose-headings:font-bold prose-a:text-indigo-600 max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Personnalisation des liens pour qu'ils s'ouvrent dans un nouvel onglet
                                a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />
                            }}
                        >
                            {content || '*Rien à afficher...*'}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default MilkdownEditor;