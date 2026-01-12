import { marked } from 'marked';

export const ExportController = {
  async exportToHTML(title: string, markdown: string): Promise<void> {
    const contentHtml = await marked.parse(markdown);

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
            background-color: #ffffff; /* Fond de la page blanc */
          }
          
          /* --- CORRECTION ICI --- */
          /* On force le bloc <pre> (le cadre) à prendre la couleur de fond de Atom One Dark (#282c34) */
          .markdown-body pre {
            background-color: #282c34 !important; 
            border: 1px solid #282c34 !important;
            border-radius: 8px !important;
          }

          /* Ajustement du code à l'intérieur pour qu'il respire */
          pre code.hljs {
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            padding: 1.5em !important;
            background-color: transparent !important; /* Laisse voir le fond du pre */
          }

          @media (max-width: 767px) {
            body { padding: 15px; }
          }
        </style>
      </head>
      <body class="markdown-body">
        
        ${contentHtml}

        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script>hljs.highlightAll();</script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportToPDF(): Promise<void> {
    window.print();
  }
};