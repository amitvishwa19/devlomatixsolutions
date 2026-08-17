/**
 * FlowGenix Multimodal File & Document Processor
 * Handles client/server side parsing, base64 encoding, and multimodal payload structuring
 */

export const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
];

export const SUPPORTED_TEXT_EXTENSIONS = [
    'txt', 'md', 'csv', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 
    'html', 'css', 'scss', 'sql', 'xml', 'yaml', 'yml', 'env', 
    'log', 'sh', 'bash', 'java', 'c', 'cpp', 'rs', 'go', 'php'
];

/**
 * Format file size into human readable string (KB, MB)
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Parse a file from an input event or dropzone
 * Returns structured metadata and payload
 */
export async function processAttachedFile(file) {
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (isImage) {
            reader.onload = () => {
                resolve({
                    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: file.name,
                    size: file.size,
                    formattedSize: formatFileSize(file.size),
                    type: 'image',
                    mimeType: file.type,
                    dataUrl: reader.result, // base64 data URL
                    preview: reader.result
                });
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        } else {
            // Text / Code / CSV / Document
            reader.onload = () => {
                const textContent = reader.result;
                const lineCount = typeof textContent === 'string' ? textContent.split('\n').length : 0;
                resolve({
                    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: file.name,
                    size: file.size,
                    formattedSize: formatFileSize(file.size),
                    type: extension === 'csv' ? 'csv' : (extension === 'json' ? 'json' : 'document'),
                    extension,
                    mimeType: file.type || 'text/plain',
                    content: textContent,
                    lineCount,
                    preview: textContent.slice(0, 300)
                });
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        }
    });
}

/**
 * Construct OpenAI/Gemini compatible multimodal message content
 */
export function buildMultimodalMessageContent(userText, attachments = []) {
    if (!attachments || attachments.length === 0) {
        return userText;
    }

    const hasImages = attachments.some(a => a.type === 'image');
    let documentContextText = "";

    // Append text documents to prompt context
    const textAttachments = attachments.filter(a => a.type !== 'image');
    if (textAttachments.length > 0) {
        documentContextText = textAttachments.map(doc => {
            return `--- [Attached File: ${doc.name} (${doc.formattedSize || ''})] ---\n${doc.content}\n--- [End of ${doc.name}] ---`;
        }).join('\n\n');
    }

    const combinedText = [
        documentContextText ? `${documentContextText}\n\n` : '',
        userText || 'Analyze the attached files.'
    ].filter(Boolean).join('');

    // If no images, pure string is optimal and compatible with all models
    if (!hasImages) {
        return combinedText;
    }

    // If images present, return multimodal content array for Vision models
    const contentParts = [
        { type: "text", text: combinedText }
    ];

    attachments.filter(a => a.type === 'image').forEach(img => {
        contentParts.push({
            type: "image_url",
            image_url: {
                url: img.dataUrl,
                detail: "auto"
            }
        });
    });

    return contentParts;
}
