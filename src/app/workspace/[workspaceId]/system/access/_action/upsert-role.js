'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

import { ensureAdmin } from "@/lib/auth-utils";

const UpsertRole = z.object({
  formData: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    permissions: z.array(z.any()).optional(),
    parentId: z.string().optional().nullable(),
  }),
});

const handler = async (data) => {
  const session = await ensureAdmin();
  const userId = session.user.userId;
  const { formData } = data
  let role

  try {
    // Sync permissions: ensure navbar missions exist in the DB, then collect IDs
    const submittedPerms = formData.permissions || [];
    const activePerms = submittedPerms.filter(p => p.status === true);
    const perms = [];

    for (const p of activePerms) {
      if (p.value?.startsWith('navigation.')) {
        const existingPerm = await db.permission.upsert({
          where: { value: p.value },
          update: {
            title: p.title || `Nav: ${p.value.split(':').pop()}`,
            type: "NAVIGATION",
            url: p.url || null,
          },
          create: {
            value: p.value,
            title: p.title || `Nav: ${p.value.split(':').pop()}`,
            description: `Navigation access for ${p.title || p.value}`,
            category: p.category || "navigation",
            type: "NAVIGATION",
            url: p.url || null,
            status: true
          }
        });
        perms.push({ id: existingPerm.id });
      } else if (p.id && !p.id.startsWith('nav-') && !p.id.startsWith('new-')) {
        perms.push({ id: p.id });
      } else if (p.value) {
        const existingPerm = await db.permission.upsert({
          where: { value: p.value },
          update: {
            title: p.title || p.value,
            category: p.category || (p.value.includes('.') ? p.value.split('.')[0] : 'general'),
            type: p.type || "ACTION",
            url: p.url || null,
          },
          create: {
            value: p.value,
            title: p.title || p.value,
            description: p.description || `Permission for ${p.value}`,
            category: p.category || (p.value.includes('.') ? p.value.split('.')[0] : 'general'),
            type: p.type || "ACTION",
            url: p.url || null,
            status: true
          }
        });
        perms.push({ id: existingPerm.id });
      }
    }

    // Deduplicate permission IDs
    const uniquePerms = Array.from(new Set(perms.map(p => p.id))).map(id => ({ id }));

    role = await db.role.upsert({
      where: {
        id: formData.id || '000'
      },
      create: {
        title: formData?.title,
        slug: slug(formData?.title),
        description: formData?.description,
        color: formData?.color,
        parent: formData.parentId ? { connect: { id: formData.parentId } } : undefined,
        permissions: {
          connect: uniquePerms
        }
      },
      update: {
        title: formData?.title,
        slug: slug(formData?.title),
        description: formData?.description,
        color: formData?.color,
        parent: formData.parentId ? { connect: { id: formData.parentId } } : (formData.parentId === null ? { disconnect: true } : undefined),
        permissions: {
          set: uniquePerms
        }
      },
      include: {
        permissions: true
      },
    })

  } catch (error) {
    console.error('Upsert Role Error:', error)
    return {
      message: error?.message || "Oops!, something went wrong", 
      error: error
    }
  }

  return { data: { role } };
}

export const upsertRole = createSafeAction(UpsertRole, handler);