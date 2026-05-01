import crypto from 'crypto';

/**
 * WhatsApp Flow Encryption Helper (AES-256-GCM)
 * Used for secure data exchange between Meta and our Flow Endpoint.
 */
export class WAFlowEncryption {
    constructor(privateKeyPem, passphrase = '') {
        this.privateKey = privateKeyPem;
        this.passphrase = passphrase;
    }

    /**
     * Decrypts the payload from Meta
     */
    decrypt(encryptedData, encryptedAesKey, initialVector) {
        try {
            // 1. Decrypt the AES key using our Private RSA Key
            const aesKey = crypto.privateDecrypt(
                {
                    key: this.privateKey,
                    passphrase: this.passphrase,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256",
                },
                Buffer.from(encryptedAesKey, 'base64')
            );

            // 2. Decrypt the Data using the decrypted AES key
            const iv = Buffer.from(initialVector, 'base64');
            const data = Buffer.from(encryptedData, 'base64');
            
            // Meta puts the auth tag at the end of the encrypted data (last 16 bytes)
            const tag = data.slice(-16);
            const cipherText = data.slice(0, -16);

            const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(cipherText, 'binary', 'utf8');
            decrypted += decipher.final('utf8');

            return JSON.parse(decrypted);
        } catch (error) {
            console.error("[WAFlowEncryption] Decryption Failed:", error);
            throw new Error("Failed to decrypt flow payload");
        }
    }

    /**
     * Encrypts the response to send back to Meta
     */
    encrypt(responsePayload, encryptedAesKey, initialVector) {
        try {
            // 1. Reuse the same AES key and IV provided by Meta for the response
            const aesKey = crypto.privateDecrypt(
                {
                    key: this.privateKey,
                    passphrase: this.passphrase,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256",
                },
                Buffer.from(encryptedAesKey, 'base64')
            );

            const iv = Buffer.from(initialVector, 'base64');
            const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);

            let encrypted = cipher.update(JSON.stringify(responsePayload), 'utf8', 'base64');
            encrypted += cipher.final('base64');

            const tag = cipher.getAuthTag().toString('base64');

            // The final payload sent back to Meta is just the encrypted string (base64)
            // Note: Meta expects the auth tag to be appended in some versions, 
            // but for Flow Endpoint, the entire response body should be the encrypted string.
            return encrypted + tag; 
        } catch (error) {
            console.error("[WAFlowEncryption] Encryption Failed:", error);
            throw new Error("Failed to encrypt flow response");
        }
    }
}
