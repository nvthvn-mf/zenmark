import React, { useEffect, useRef } from 'react';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';

interface MilkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

const EditorComponent: React.FC<MilkdownEditorProps> = ({ content, onChange, readonly }) => {
  // Hook pour créer l'instance de l'éditeur
  const { get } = useEditor((root) =>
          Editor.make()
              .config((ctx) => {
                // Définit l'élément racine (div) où l'éditeur va s'injecter
                ctx.set(rootCtx, root);
                // Définit la valeur initiale
                ctx.set(defaultValueCtx, content);

                // Configure l'écouteur de changements
                ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
                  if (markdown !== prevMarkdown) {
                    onChange(markdown);
                  }
                });
              })
              .config(nord) // Applique le thème visuel
              .use(commonmark) // Active la syntaxe Markdown standard
              .use(history) // Active Ctrl+Z / Ctrl+Y
              .use(listener) // Active l'écouteur
      , []); // Le tableau vide [] assure que l'éditeur ne se recrée pas à chaque rendu

  return <Milkdown />;
};

const MilkdownEditor: React.FC<MilkdownEditorProps> = (props) => {
  return (
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-white relative">
        <div className="flex-1 overflow-y-auto px-8 py-4 prose prose-slate max-w-none mx-auto w-full md:w-[850px]">
          <MilkdownProvider>
            <EditorComponent {...props} />
          </MilkdownProvider>
        </div>

        {!props.readonly && (
            <div className="absolute bottom-6 right-8 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-4 text-xs font-medium text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border pointer-events-none">
              {/* Compteur de mots simple basé sur les espaces */}
              <span>{props.content.split(/\s+/).filter(Boolean).length} words</span>
              <span>{props.content.length} chars</span>
            </div>
        )}
      </div>
  );
};

export default MilkdownEditor;