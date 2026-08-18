'use server';

import { revalidatePath } from 'next/cache';

let mockPosts = [
    {
        id: 'post-1',
        channel: 'LinkedIn',
        content: '🚀 Super excited to announce our new WhatsApp Automation capabilities! Businesses can now automate 80% of customer support workflows with zero-code.',
        schedule: 'Today at 2:00 PM',
        status: 'Scheduled',
        hasMedia: true
    },
    {
        id: 'post-2',
        channel: 'X (Twitter)',
        content: 'Why multi-model AI routing saves 60% on LLM inference costs. A quick deep dive into intelligent prompt orchestration 🧵👇',
        schedule: 'Tomorrow at 10:30 AM',
        status: 'Scheduled',
        hasMedia: false
    },
    {
        id: 'post-3',
        channel: 'Instagram',
        content: 'Behind the scenes at Devlomatix: Crafting pixel-perfect developer experiences ✨ #DeveloperTools #SaaS #BuildInPublic',
        schedule: 'Aug 20 at 6:00 PM',
        status: 'Draft',
        hasMedia: true
    }
];

let mockAccounts = [
    { id: 'acc-1', platform: 'LinkedIn', username: 'Devlomatix Solutions', handle: '@devlomatix', status: 'Connected', followers: '14.2K' },
    { id: 'acc-2', platform: 'X (Twitter)', username: 'Devlomatix HQ', handle: '@devlomatix_hq', status: 'Connected', followers: '28.6K' },
    { id: 'acc-3', platform: 'Facebook', username: 'Devlomatix Official', handle: '@devlomatix.official', status: 'Connected', followers: '8.4K' },
    { id: 'acc-4', platform: 'Instagram', username: 'Devlomatix Tech', handle: '@devlomatix_tech', status: 'Connected', followers: '19.1K' }
];

export async function getPosts(workspaceId) {
    try {
        return { success: true, data: mockPosts };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createPost(workspaceId, data) {
    try {
        const newPost = {
            id: `post-${Date.now()}`,
            channel: data.channel || 'LinkedIn',
            content: data.content || '',
            schedule: data.schedule || 'Scheduled for tomorrow',
            status: data.publishNow ? 'Published' : 'Scheduled',
            hasMedia: Boolean(data.hasMedia)
        };
        mockPosts.unshift(newPost);
        revalidatePath(`/workspace/${workspaceId}/socialhub`);
        return { success: true, data: newPost };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function publishPostNow(workspaceId, postId) {
    try {
        const p = mockPosts.find(post => post.id === postId);
        if (p) {
            p.status = 'Published';
            revalidatePath(`/workspace/${workspaceId}/socialhub`);
            return { success: true, data: p };
        }
        return { success: false, error: 'Post not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deletePost(workspaceId, postId) {
    try {
        mockPosts = mockPosts.filter(p => p.id !== postId);
        revalidatePath(`/workspace/${workspaceId}/socialhub`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAccounts(workspaceId) {
    try {
        return { success: true, data: mockAccounts };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function connectAccount(workspaceId, data) {
    try {
        const newAcc = {
            id: `acc-${Date.now()}`,
            platform: data.platform || 'LinkedIn',
            username: data.username || 'New Connected Brand',
            handle: data.handle?.startsWith('@') ? data.handle : `@${data.handle || 'brand'}`,
            status: 'Connected',
            followers: '1.2K'
        };
        mockAccounts.push(newAcc);
        revalidatePath(`/workspace/${workspaceId}/socialhub`);
        return { success: true, data: newAcc };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
