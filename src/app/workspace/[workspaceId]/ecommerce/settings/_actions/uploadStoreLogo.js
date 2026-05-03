'use server'

import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function uploadStoreLogo(formData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const file = formData.get('file');
        if (!file) {
            return { success: false, message: "No file provided" };
        }

        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileName = `store-logo-${timestamp}-${randomId}.${fileExt}`;
        
        const userId = session.user.userId;
        const filePath = `${userId}/logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('ecommerce')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[UPLOAD_ERROR]', uploadError);
            return { success: false, message: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('ecommerce')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[UPLOAD_STORE_LOGO_ERROR]', error);
        return { success: false, message: "Failed to upload logo" };
    }
}