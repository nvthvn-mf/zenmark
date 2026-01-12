import { marked } from 'marked';

export const ExportController = {
  async exportToHTML(title: string, markdown: string): Promise<void> {
    // 1. Convertir le Markdown en HTML proprement
    // marked.parse peut retourner une Promise, on l'attend
    const contentHtml = await marked.parse(markdown);

    // 2. Créer le template HTML complet avec du CSS pour le style
    // On utilise "github-markdown-css" pour avoir un rendu propre instantané
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css](https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css)">
        <style>
          body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
          @media (max-width: 767px) {
            body {
              padding: 15px;
            }
          }
          /* Petit ajustement pour l'impression */
          @media print {
            body { padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body class="markdown-body">
        <h1>${title}</h1>
        ${contentHtml}
      </body>
      </html>
    `;

    // 3. Créer le fichier et déclencher le téléchargement
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportToPDF(): Promise<void> {
    // Pour le PDF, on imprime la vue actuelle qui est déjà bien formatée
    window.print();
  }
};