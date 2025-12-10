import { put } from '@vercel/blob';

export async function uploadToBlob({ file, name = null, type = 'vercel', path = null }) {
    let imgUrl
    let tempPath

    try {

        const timestamp = Date.now();
        const tempFile = file.get('file')
        const fileName = file.get("file")?.name?.split('.', 1).toString()
        const fileExtention = tempFile?.name?.split('.').pop()
        const tempFileName = name ? `${name}-${fileName}-${timestamp}.${fileExtention}` : `${fileName}-${timestamp}.${fileExtention}`;

        if (path) {
            tempPath = path + '/'
        }



        if (type === 'vercel') {
            const blob = await put(`${tempPath}${tempFileName}`, file.get('file'), {
                access: 'public',
                allowOverwrite: true
            })
            imgUrl = blob.url
        }

        console.log('✅Image Uploaded (uploadToBlob):', imgUrl);
        return imgUrl;
    } catch (error) {
        console.error('❌ Blob upload failed:', error);
        throw error;
    }
}