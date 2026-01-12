import { marked } from 'marked';

export const ExportController = {
  async exportToHTML(title: string, markdown: string): Promise<void> {
    // 1. Convertir le Markdown en HTML
    const contentHtml = await marked.parse(markdown);

    // 2. Construire le fichier HTML final
    // - On garde github-markdown-css pour la mise en page globale (propre)
    // - On ajoute highlight.js (atom-one-dark) pour le style "IDE" des blocs de code
    // - On ajoute un petit script pour activer la coloration au chargement du fichier
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">

        <style>
          body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          }
          
          /* Force l'arrondi et le padding pour faire joli comme dans l'app */
          pre code.hljs {
            padding: 1.5em;
            border-radius: 8px;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            line-height: 1.5;
          }

          @media (max-width: 767px) {
            body { padding: 15px; }
          }
        </style>
      </head>
      <body class="markdown-body">
        <h1>${title}</h1>
        ${contentHtml}

        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script>hljs.highlightAll();</script>
      </body>
      </html>
    `;

    // 3. Téléchargement
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportToPDF(): Promise<void> {
    // L'impression native du navigateur respectera aussi les couleurs si l'option "Background graphics" est cochée
    window.print();
  }
};