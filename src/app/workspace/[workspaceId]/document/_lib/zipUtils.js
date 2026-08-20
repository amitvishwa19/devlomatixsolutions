import JSZip from 'jszip';
import { toast } from 'sonner';

/**
 * Downloads multiple workspace documents / files as a single ZIP archive.
 * @param {Array} documents - Array of document objects to download
 * @param {string} zipName - Name of the output zip file
 */
export async function downloadFilesAsZip(documents = [], zipName = 'workspace-documents.zip') {
    if (!documents || documents.length === 0) {
        toast.error("No documents selected to download");
        return;
    }

    const toastId = toast.loading(`Preparing ZIP archive for ${documents.length} item(s)...`);
    const zip = new JSZip();

    try {
        let addedCount = 0;

        for (const doc of documents) {
            if (doc.isFolder) {
                // If it's a folder, create a folder in zip
                zip.folder(doc.name || 'Folder');
                continue;
            }

            const cleanName = (doc.name || 'untitled').replace(/[\\/:*?"<>|]/g, '_');

            if (doc.content && (!doc.fileUrl || doc.fileType === 'application/vnd.devlomatix.note')) {
                // Rich Text Note -> save as markdown / text
                const plainText = doc.content
                    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
                    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
                    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
                    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
                    .replace(/<br\s*[\/]?>/gi, '\n')
                    .replace(/<hr\s*[\/]?>/gi, '\n---\n\n')
                    .replace(/<[^>]+>/g, '')
                    .trim();

                const noteFileName = cleanName.endsWith('.md') || cleanName.endsWith('.txt') ? cleanName : `${cleanName}.md`;
                zip.file(noteFileName, plainText || doc.content);
                addedCount++;
            } else if (doc.fileUrl) {
                // Fetch external file and add to zip
                try {
                    const response = await fetch(doc.fileUrl);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    zip.file(cleanName, blob);
                    addedCount++;
                } catch (fetchErr) {
                    console.warn(`Could not fetch file for ZIP: ${doc.name}`, fetchErr);
                    // Fallback: create a .url shortcut file
                    zip.file(`${cleanName}.url`, `[InternetShortcut]\nURL=${doc.fileUrl}\n`);
                    addedCount++;
                }
            }
        }

        if (addedCount === 0) {
            toast.error("Could not package any selected documents", { id: toastId });
            return;
        }

        toast.loading("Compressing files...", { id: toastId });
        const content = await zip.generateAsync({ type: 'blob' });

        // Trigger browser download
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Downloaded ${addedCount} document(s) as ZIP`, { id: toastId });
    } catch (error) {
        console.error("ZIP Generation error:", error);
        toast.error("Failed to generate ZIP archive", { id: toastId });
    }
}
