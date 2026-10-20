'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { DEFAULT_ORG_TEMPLATES } from "../_lib/org-templates";

/**
 * Fetch organizational structure and workspace users
 * OrgBuilderSettings is universal global across all users and workspaces.
 */
export async function getOrgBuilderData(workspaceId = 'global') {
  try {
    const cleanWsId = String(workspaceId || 'global');

    // 1. Fetch all active organization team members / users across the platform
    const users = await db.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        avatar: true,
        role: true,
        phone: true,
        createdAt: true
      },
      orderBy: {
        displayName: 'asc'
      }
    });

    // 2. Query AppSettings for saved org hierarchy (Primary: 'org_structure_global')
    const globalRecord = await db.appSettings.findUnique({
      where: { key: 'org_structure_global' }
    }).catch(() => null);

    let structure = null;
    if (globalRecord?.general && typeof globalRecord.general === 'object') {
      structure = globalRecord.general;
    } else {
      // Check legacy workspace-specific key if migrating from earlier version
      const legacyRecord = (cleanWsId !== 'global')
        ? await db.appSettings.findUnique({
            where: { key: `org_structure_${cleanWsId}` }
          }).catch(() => null)
        : null;

      if (legacyRecord?.general && typeof legacyRecord.general === 'object') {
        structure = legacyRecord.general;
      } else {
        // Fallback to default tech startup template
        structure = DEFAULT_ORG_TEMPLATES.tech_startup;
      }
    }

    return {
      success: true,
      structure,
      users: users || [],
      templates: Object.keys(DEFAULT_ORG_TEMPLATES)
    };
  } catch (error) {
    console.error('[getOrgBuilderData] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load organization builder data',
      structure: DEFAULT_ORG_TEMPLATES.tech_startup,
      users: []
    };
  }
}

/**
 * Persist organizational hierarchy structure to PostgreSQL globally
 */
export async function saveOrgStructure(workspaceId = 'global', structure) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return { success: false, error: 'Unauthorized: Admin authentication required' };
    }

    // Support both saveOrgStructure(structure) and saveOrgStructure(workspaceId, structure)
    let payload = structure;
    let targetWsId = workspaceId;
    if (typeof workspaceId === 'object' && structure === undefined) {
      payload = workspaceId;
      targetWsId = 'global';
    }

    if (!payload || !payload.nodes || !payload.rootNodeId) {
      return { success: false, error: 'Invalid organization structure payload' };
    }

    const payloadToSave = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.userId
    };

    // 1. Persist strictly to Universal Global AppSettings key
    await db.appSettings.upsert({
      where: { key: 'org_structure_global' },
      create: {
        key: 'org_structure_global',
        general: payloadToSave
      },
      update: {
        general: payloadToSave
      }
    });

    // 2. Also keep workspace key updated if a custom workspace ID was supplied (backward compatibility)
    if (targetWsId && targetWsId !== 'global' && targetWsId !== 'default') {
      await db.appSettings.upsert({
        where: { key: `org_structure_${targetWsId}` },
        create: {
          key: `org_structure_${targetWsId}`,
          general: payloadToSave
        },
        update: {
          general: payloadToSave
        }
      }).catch(() => {});
    }

    return {
      success: true,
      message: 'Organization hierarchy structure saved globally',
      structure: payloadToSave
    };
  } catch (error) {
    console.error('[saveOrgStructure] Error saving organization hierarchy:', error);
    return {
      success: false,
      error: error.message || 'Failed to save organization hierarchy'
    };
  }
}

/**
 * Reset organization hierarchy to a specific preset template globally
 */
export async function resetOrgStructureToTemplate(workspaceId = 'global', templateKey = 'tech_startup') {
  try {
    const template = DEFAULT_ORG_TEMPLATES[templateKey] || DEFAULT_ORG_TEMPLATES.tech_startup;
    return await saveOrgStructure('global', template);
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to apply organization template'
    };
  }
}

