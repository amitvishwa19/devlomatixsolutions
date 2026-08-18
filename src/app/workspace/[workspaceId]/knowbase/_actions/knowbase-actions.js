'use server';

import { revalidatePath } from 'next/cache';

let mockArticles = [
    {
        id: 'art-1',
        title: 'How to connect your Meta WhatsApp Cloud API credentials',
        category: 'WhatsApp & KonnectX Guides',
        content: 'Step-by-step guide on setting up System User Token, WABA ID, Phone Number ID in Meta Business Manager and pasting into Devlomatix credentials.',
        views: '3.4k',
        helpful: '98%',
        visibility: 'Public',
        updated: '2 days ago'
    },
    {
        id: 'art-2',
        title: 'Configuring custom domains and SSL certificates for your storefront',
        category: 'Getting Started & Setup',
        content: 'Add CNAME records pointing to your workspace domain and automatically generate zero-config TLS certificates.',
        views: '1.8k',
        helpful: '95%',
        visibility: 'Public',
        updated: '1 week ago'
    },
    {
        id: 'art-3',
        title: 'Internal Team Onboarding and Access Control Guidelines',
        category: 'Internal SOPs & Team Wiki',
        content: 'Role-based access permissions, super-admin capabilities, and security token policies for all internal staff.',
        views: '640',
        helpful: '100%',
        visibility: 'Internal',
        updated: '3 weeks ago'
    }
];

let mockCategories = [
    { id: 'cat-1', name: 'Getting Started & Setup', count: 12, views: '4.2k' },
    { id: 'cat-2', name: 'WhatsApp & KonnectX Guides', count: 15, views: '8.1k' },
    { id: 'cat-3', name: 'Billing & Invoice FAQs', count: 8, views: '2.4k' },
    { id: 'cat-4', name: 'Internal SOPs & Team Wiki', count: 11, views: '980' }
];

export async function getArticles(workspaceId) {
    try {
        return { success: true, data: mockArticles };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createArticle(workspaceId, data) {
    try {
        const newArt = {
            id: `art-${Date.now()}`,
            title: data.title || 'Untitled Guide',
            category: data.category || 'Getting Started & Setup',
            content: data.content || '',
            views: '0',
            helpful: '100%',
            visibility: data.visibility || 'Public',
            updated: 'Just now'
        };
        mockArticles.unshift(newArt);
        revalidatePath(`/workspace/${workspaceId}/knowbase`);
        return { success: true, data: newArt };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getCategories(workspaceId) {
    try {
        return { success: true, data: mockCategories };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createCategory(workspaceId, name) {
    try {
        const newCat = {
            id: `cat-${Date.now()}`,
            name: name || 'New Collection',
            count: 0,
            views: '0'
        };
        mockCategories.push(newCat);
        revalidatePath(`/workspace/${workspaceId}/knowbase`);
        return { success: true, data: newCat };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteArticle(workspaceId, id) {
    try {
        mockArticles = mockArticles.filter(a => a.id !== id);
        revalidatePath(`/workspace/${workspaceId}/knowbase`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(workspaceId, id) {
    try {
        mockCategories = mockCategories.filter(c => c.id !== id);
        revalidatePath(`/workspace/${workspaceId}/knowbase`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
