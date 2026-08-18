'use server';

import { revalidatePath } from 'next/cache';

let mockForms = [
    {
        id: 'form-1',
        title: 'Enterprise AI Consultation Request',
        description: 'Captures business requirements, budget, timeline, and routes leads to WhatsApp sales agents.',
        submissionsCount: 420,
        viewsCount: 1250,
        conversion: '33.6%',
        status: 'Live',
        updatedAt: 'Yesterday',
        fields: ['Full Name', 'Company Name', 'Work Email', 'Estimated AI Tokens/Mo', 'Project Timeline']
    },
    {
        id: 'form-2',
        title: 'Candidate Pre-Screening Survey',
        description: 'Multi-step questionnaire for software engineering applicants in HireFlow.',
        submissionsCount: 890,
        viewsCount: 1100,
        conversion: '80.9%',
        status: 'Live',
        updatedAt: '3 days ago',
        fields: ['Candidate Name', 'GitHub Profile', 'Years of Experience', 'Notice Period', 'Expected Compensation']
    },
    {
        id: 'form-3',
        title: 'Post-Purchase Customer CSAT & Feedback',
        description: 'Automated feedback survey triggered 48 hours after eCommerce order delivery.',
        submissionsCount: 1640,
        viewsCount: 2400,
        conversion: '68.3%',
        status: 'Live',
        updatedAt: '5 days ago',
        fields: ['Order Number', 'Product Rating (1-5)', 'Delivery Speed', 'Would Recommend?', 'Comments']
    }
];

let mockSubmissions = [
    { id: 'subm-401', formId: 'form-1', formTitle: 'Enterprise AI Consultation', submitter: 'David Chen (TechCorp)', date: '10 mins ago', summary: 'Wants 500k daily token AI gateway routing.' },
    { id: 'subm-400', formId: 'form-2', formTitle: 'Candidate Pre-Screening', submitter: 'Elena Rostova', date: '1 hour ago', summary: 'Senior Frontend Dev applicant, 6 yrs experience.' },
    { id: 'subm-399', formId: 'form-3', formTitle: 'Post-Purchase CSAT', submitter: 'Rajesh Sharma', date: '3 hours ago', summary: 'Rated 5/5 stars for lightning fast delivery.' }
];

export async function getForms(workspaceId) {
    try {
        return { success: true, data: mockForms };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createForm(workspaceId, data) {
    try {
        const newForm = {
            id: `form-${Date.now()}`,
            title: data.title || 'Untitled Form',
            description: data.description || 'Custom response collection form',
            submissionsCount: 0,
            viewsCount: 0,
            conversion: '0%',
            status: 'Live',
            updatedAt: 'Just now',
            fields: data.fields || ['Full Name', 'Email Address', 'Message']
        };
        mockForms.unshift(newForm);
        revalidatePath(`/workspace/${workspaceId}/formcraft`);
        return { success: true, data: newForm };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function toggleFormStatus(workspaceId, formId) {
    try {
        const f = mockForms.find(form => form.id === formId);
        if (f) {
            f.status = f.status === 'Live' ? 'Draft' : 'Live';
            revalidatePath(`/workspace/${workspaceId}/formcraft`);
            return { success: true, data: f };
        }
        return { success: false, error: 'Form not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateFormFields(workspaceId, formId, fields) {
    try {
        const f = mockForms.find(form => form.id === formId);
        if (f) {
            f.fields = fields;
            f.updatedAt = 'Just now';
            revalidatePath(`/workspace/${workspaceId}/formcraft`);
            return { success: true, data: f };
        }
        return { success: false, error: 'Form not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteForm(workspaceId, formId) {
    try {
        mockForms = mockForms.filter(f => f.id !== formId);
        revalidatePath(`/workspace/${workspaceId}/formcraft`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getSubmissions(workspaceId) {
    try {
        return { success: true, data: mockSubmissions };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function submitFormData(workspaceId, formId, data) {
    try {
        const form = mockForms.find(f => f.id === formId);
        const newSub = {
            id: `subm-${Date.now().toString().slice(-4)}`,
            formId: formId,
            formTitle: form ? form.title : 'Custom Form',
            submitter: data.fullName || data.name || data.email || 'Website Visitor',
            date: 'Just now',
            summary: Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | '),
            answers: data
        };
        mockSubmissions.unshift(newSub);
        if (form) {
            form.submissionsCount = (form.submissionsCount || 0) + 1;
        }
        revalidatePath(`/workspace/${workspaceId}/formcraft`);
        return { success: true, data: newSub };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
