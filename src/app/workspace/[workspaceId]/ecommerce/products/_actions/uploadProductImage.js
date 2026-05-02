'use server'

import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function uploadProductImage(formData) {
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
        const fileName = `img-${timestamp}-${randomId}.${fileExt}`;
        
        // Upload to 'products' bucket directly with user folder
        const userId = session.user.userId;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[UPLOAD_ERROR]', uploadError);
            return { success: false, message: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        console.log('[UPLOAD_SUCCESS]', publicUrl);

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[UPLOAD_PRODUCT_IMAGE_ERROR]', error);
        return { success: false, message: "Failed to upload image" };
    }
}