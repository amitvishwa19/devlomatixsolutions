/**
 * Export and Printing Utilities for Documents and Notes
 */

export function exportToMarkdown(document) {
    const title = document.name || 'Untitled Document';
    const date = new Date(document.createdAt || Date.now()).toLocaleDateString();
    const category = document.category || 'GENERAL';
    const tags = Array.isArray(document.tags) ? document.tags.map(t => `#${t}`).join(' ') : '';
    
    // Simple HTML to Markdown stripper/converter
    let mdContent = document.content || '';
    mdContent = mdContent
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<code>(.*?)<\/code>/gi, '`$1`')
        .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
        .replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')
        .replace(/<hr\s*\/?>/gi, '---\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ''); // strip any remaining tags

    const header = `# ${title}\n\n**Category:** ${category} | **Created:** ${date}\n${tags ? `**Tags:** ${tags}\n` : ''}\n---\n\n`;
    const fullMarkdown = header + mdContent.trim();

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToHTML(document) {
    const title = document.name || 'Untitled Document';
    const date = new Date(document.createdAt || Date.now()).toLocaleDateString();
    const category = document.category || 'GENERAL';

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { font-size: 20px; margin-top: 24px; color: #1e293b; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    .badge { background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <span class="badge">${category}</span> • Created on ${date}
  </div>
  <div class="content">
    ${document.content || '<p>No content available.</p>'}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function printDocumentToPDF(document) {
    const title = document.name || 'Untitled Document';
    const date = new Date(document.createdAt || Date.now()).toLocaleDateString();
    const category = document.category || 'GENERAL';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; font-size: 12pt; color: #000; }
      @page { margin: 15mm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
    h2 { font-size: 18px; margin-top: 20px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 15px; margin-top: 16px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 11px; }
    code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
    ul, ol { padding-left: 20px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <strong>Category:</strong> ${category} | <strong>Created:</strong> ${date} | <strong>Status:</strong> ${document.status || 'APPROVED'}
  </div>
  <div class="content">
    ${document.content || '<p>No content.</p>'}
  </div>
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`);

    printWindow.document.close();
}
