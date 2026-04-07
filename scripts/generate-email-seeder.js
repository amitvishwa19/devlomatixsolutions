import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailDir = path.join(process.cwd(), 'src', 'emails');
const seederTemplatePath = path.join(process.cwd(), 'prisma', 'seeds', 'seed-email-templates.js');

const defaultAssignments = [
    { event: 'BOARD_NOTIFICATION', templateName: 'BoardNotification.jsx', subject: 'Updates on your Kanban Board' },
    { event: 'CARD_NOTIFICATION', templateName: 'CardNotification.jsx', subject: 'Activity on your Kanban Card' },
    { event: 'WORKSPACE_INVITE', templateName: 'InviteEmailTemplate.jsx', subject: 'You have been invited to join a Workspace' },
    { event: 'JOB_APPLICATION_ACK', templateName: 'JobApplyConfirmation.jsx', subject: 'Your Job Application has been Received' },
    { event: 'LIST_NOTIFICATION', templateName: 'ListNotification.jsx', subject: 'Updates to your Kanban List' },
    { event: 'SYSTEM_NOTIFICATION', templateName: 'NotificationMail.jsx', subject: 'Important System Notification' },
    { event: 'USER_REGISTRATION', templateName: 'RegisterationMail.jsx', subject: 'Welcome to our Platform!' },
    { event: 'ADMIN_REGISTRATION_ALERT', templateName: 'RegistrationNotification.jsx', subject: 'Alert: New User Registration' },
    { event: 'SERVER_NOTIFICATION', templateName: 'ServerNotification.jsx', subject: 'Server Status Update' },
    { event: 'USER_WELCOME', templateName: 'welcome.jsx', subject: 'Welcome Aboard!' }
];

let seederContent = `import "dotenv/config";
import { prisma } from '../prisma.js';

async function main() {
    console.log('--- Starting Email Templates Seeder ---');

    // 1. Get the first user to determine a workspace (or use defaults)
    const user = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    }) || await prisma.user.findFirst();

    const workspaceId = process.env.WORKSPACE_ID || 'cmn3zvsj6000dd8ikegztlu1m';

    console.log(\`Workspace ID for Templates: \${workspaceId}\`);

    // Default Email Assignments
    const defaultAssignments = [
`;

for (let i = 0; i < defaultAssignments.length; i++) {
    const item = defaultAssignments[i];
    const filePath = path.join(emailDir, item.templateName);
    let contentStr = 'null';
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        contentStr = JSON.stringify(fileContent); // safely escape the content
    }

    seederContent += `        {
            event: '${item.event}',
            templateName: '${item.templateName}',
            subject: '${item.subject}',
            content: ${contentStr}
        }${i < defaultAssignments.length - 1 ? ',' : ''}
`;
}

seederContent += `    ];

    let count = 0;
    for (const assignment of defaultAssignments) {
        await prisma.emailAssignment.upsert({
            where: {
                workspaceId_event: {
                    workspaceId,
                    event: assignment.event
                }
            },
            update: {
                templateName: assignment.templateName,
                subject: assignment.subject,
                isActive: true,
                content: assignment.content
            },
            create: {
                workspaceId,
                event: assignment.event,
                templateName: assignment.templateName,
                subject: assignment.subject,
                isActive: true,
                content: assignment.content
            }
        });
        count++;
    }

    console.log(\`Seeded \${count} Email Assignments with Content embedded.\`);
    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
`;

fs.writeFileSync(seederTemplatePath, seederContent, 'utf8');
console.log('Generater seeder correctly at', seederTemplatePath);
