import "dotenv/config";
import { prisma } from './prisma.js';

async function main() {
    console.log('--- Starting ATS Seeder ---');

    // 1. Get the first user and workspace (or use defaults)
    const user = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    }) || await prisma.user.findFirst();

    if (!user) {
        console.error('No user found in the database. Please create a user first.');
        return;
    }

    const workspaceId = process.env.WORKSPACE_ID || 'cmn3zvsj6000dd8ikegztlu1m';
    const userId = user.id;

    console.log(`Seeding for User: ${user.email} (ID: ${userId})`);
    console.log(`Workspace ID: ${workspaceId}`);

    // 2. Seed Jobs
    const jobsData = [
        {
            title: 'Senior Frontend Developer',
            description: 'We are looking for a React expert with Next.js experience to lead our recruitment portal team.',
            department: 'Engineering',
            location: 'Remote',
            type: 'FULL_TIME',
            salaryRange: '$120k - $160k',
            status: 'OPEN',
            workspaceId,
            userId,
        },
        {
            title: 'UI/UX Designer',
            description: 'Join our creative team to design high-fidelity recruitment experiences using Figma and Framer.',
            department: 'Design',
            location: 'New York, NY',
            type: 'FULL_TIME',
            salaryRange: '$90k - $130k',
            status: 'OPEN',
            workspaceId,
            userId,
        },
        {
            title: 'Backend Engineer (Node.js)',
            description: 'Help us scale our AI-driven parsing engine and Prisma-based infrastructure.',
            department: 'Engineering',
            location: 'London, UK',
            type: 'CONTRACT',
            salaryRange: '$80/hr - $110/hr',
            status: 'OPEN',
            workspaceId,
            userId,
        },
        {
            title: 'HR Manager',
            department: 'People',
            description: 'Scale our hiring culture and manage the recruitment lifecycle at scale.',
            location: 'Bangalore, India',
            type: 'FULL_TIME',
            status: 'OPEN',
            workspaceId,
            userId,
        }
    ];

    const seededJobs = [];
    for (const job of jobsData) {
        const j = await prisma.job.upsert({
            where: { id: `seed-job-${job.title.toLowerCase().replace(/ /g, '-')}` },
            update: job,
            create: { id: `seed-job-${job.title.toLowerCase().replace(/ /g, '-')}`, ...job }
        });
        seededJobs.push(j);
    }
    console.log(`Seeded ${seededJobs.length} Jobs.`);

    // 3. Seed Candidates
    const candidatesData = [
        {
            name: 'Rohit Sharma',
            email: 'rohit.dev@example.com',
            phone: '+91 98765 43210',
            location: 'Mumbai, India',
            skills: ['React', 'Next.js', 'Tailwind', 'TypeScript'],
            aiSummary: 'Highly proficient Frontend Developer with strong focus on performance and accessibility.',
            aiMatchScore: 92,
            workspaceId,
            userId,
        },
        {
            name: 'Sarah Chen',
            email: 'sarah.ux@example.com',
            phone: '+1 415 555 0123',
            location: 'San Francisco, CA',
            skills: ['Figma', 'Prototyping', 'User Research', 'CSS'],
            aiSummary: 'Creative UI/UX Designer with a background in architectural design and interaction systems.',
            aiMatchScore: 88,
            workspaceId,
            userId,
        },
        {
            name: 'Elena Vovk',
            email: 'elena.node@example.com',
            phone: '+44 20 7946 0958',
            location: 'Berlin, Germany',
            skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
            aiSummary: 'Senior Systems Architect with specialization in real-time communication protocols.',
            aiMatchScore: 95,
            workspaceId,
            userId,
        }
    ];

    const seededCandidates = [];
    for (const candidate of candidatesData) {
        const c = await prisma.candidate.upsert({
            where: { email: candidate.email },
            update: candidate,
            create: candidate
        });
        seededCandidates.push(c);
    }
    console.log(`Seeded ${seededCandidates.length} Candidates.`);

    // 4. Seed Applications
    const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];
    for (let i = 0; i < seededCandidates.length; i++) {
        const candidate = seededCandidates[i];
        const job = seededJobs[i % seededJobs.length];
        const stage = stages[i % stages.length];

        const app = await prisma.application.create({
            data: {
                jobId: job.id,
                candidateId: candidate.id,
                stage,
                status: stage === 'REJECTED' ? 'REJECTED' : 'ACTIVE',
                workspaceId,
            }
        });

        if (stage === 'INTERVIEW' || stage === 'OFFER') {
            await prisma.atsNote.create({
                data: {
                    applicationId: app.id,
                    candidateId: candidate.id,
                    userId,
                    text: 'Excellent communication skills and deep technical knowledge.',
                }
            });

            await prisma.scorecard.create({
                data: {
                    applicationId: app.id,
                    candidateId: candidate.id,
                    interviewerId: userId,
                    score: 4.5,
                    feedback: 'Strongly recommended.',
                    attributes: { Technical: 5, Communication: 4 }
                }
            });

            await prisma.interview.create({
                data: {
                    applicationId: app.id,
                    title: 'Technical Round',
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000),
                    status: 'SCHEDULED',
                    interviewers: [user.displayName || 'Manager'],
                }
            });
        }
    }
    console.log('Seeded Applications, Notes, Scorecards, and Interviews.');
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
