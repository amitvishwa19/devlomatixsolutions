'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

async function getAuthContext(workspaceId) {
    await ensureWorkspaceAccess(workspaceId);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId || session?.user?.id;
    if (!userId) throw new Error("Unauthorized");
    return { userId };
}

/**
 * Format phone number strictly to 12 digits if 10 digits provided (default India 91 prefix)
 */
function formatPhoneNumber(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    return cleaned;
}

/**
 * Get Contact Groups & Categories for Workspace
 */
export async function getContactMetaAction(workspaceId) {
    try {
        await getAuthContext(workspaceId);

        const [groups, categories] = await Promise.all([
            db.contactGroup.findMany({
                where: { workspaceId },
                orderBy: { name: 'asc' }
            }),
            db.category.findMany({
                where: {
                    workspaceId,
                    OR: [
                        { type: 'CONTACT' },
                        { type: 'ATS_DEPARTMENT' },
                        { type: 'SYSTEM' },
                        { type: 'DEFAULT' }
                    ]
                },
                orderBy: { name: 'asc' }
            })
        ]);

        return {
            success: true,
            data: {
                groups: groups || [],
                categories: categories || []
            }
        };
    } catch (error) {
        console.error("[GET_CONTACT_META_ERROR]", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new Contact Category
 */
export async function createContactCategoryAction(workspaceId, { name, color }) {
    try {
        const { userId } = await getAuthContext(workspaceId);
        if (!name?.trim()) throw new Error("Category name is required");

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        const category = await db.category.create({
            data: {
                name: name.trim(),
                slug,
                color: color || '#3b82f6',
                type: 'CONTACT',
                workspaceId,
                userId
            }
        });

        return { success: true, data: category };
    } catch (error) {
        console.error("[CREATE_CONTACT_CATEGORY_ERROR]", error);
        return { success: false, error: error.message };
    }
}

/**
 * Save / Upsert Candidate as Contact in Workspace
 */
export async function saveCandidateAsContactAction(workspaceId, data) {
    try {
        const { userId } = await getAuthContext(workspaceId);

        const {
            name,
            phone,
            email,
            title,
            category,
            tags,
            type = 'CANDIDATE',
            address,
            groupIds = [],
            notes,
            candidateId
        } = data;

        if (!name?.trim()) {
            throw new Error("Contact name is required");
        }

        const cleanPhone = formatPhoneNumber(phone);
        if (!cleanPhone || cleanPhone.length < 10) {
            throw new Error("A valid phone number (at least 10 digits) is required to register contact.");
        }

        const info = {
            source: 'HireFlow ATS',
            candidateId: candidateId || undefined,
            notes: notes || "",
            savedAt: new Date().toISOString()
        };

        const existingContact = await db.contact.findFirst({
            where: {
                workspaceId,
                phone: cleanPhone
            }
        });

        let contact;
        if (existingContact) {
            contact = await db.contact.update({
                where: { id: existingContact.id },
                data: {
                    name: name.trim(),
                    email: email?.trim() || null,
                    title: title?.trim() || null,
                    category: category?.trim() || null,
                    tags: Array.isArray(tags) ? tags : [],
                    type: type || 'CANDIDATE',
                    address: address?.trim() || null,
                    info,
                    groups: {
                        set: (groupIds || []).map(id => ({ id }))
                    }
                },
                include: {
                    groups: true
                }
            });
        } else {
            contact = await db.contact.create({
                data: {
                    workspaceId,
                    userId,
                    name: name.trim(),
                    phone: cleanPhone,
                    email: email?.trim() || null,
                    title: title?.trim() || null,
                    category: category?.trim() || null,
                    tags: Array.isArray(tags) ? tags : [],
                    type: type || 'CANDIDATE',
                    address: address?.trim() || null,
                    info,
                    groups: {
                        connect: (groupIds || []).map(id => ({ id }))
                    }
                },
                include: {
                    groups: true
                }
            });
        }

        // Ensure sharing record exists
        await db.contactShare.upsert({
            where: {
                contactId_sharedWithUserId: {
                    contactId: contact.id,
                    sharedWithUserId: userId
                }
            },
            update: {},
            create: {
                contactId: contact.id,
                sharedWithUserId: userId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/hireflow/candidates`);
        return { success: true, data: contact };

    } catch (error) {
        console.error("[SAVE_CANDIDATE_AS_CONTACT_ERROR]", error);
        return { success: false, error: error.message };
    }
}
