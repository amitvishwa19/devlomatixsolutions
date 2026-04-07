import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const candidate = await prisma.candidate.findFirst({ include: { applications: true } });
        if(!candidate) return console.log("No candid");
        const user = await prisma.user.findFirst();
        
        console.log("Found", candidate.id, user.id, "app:", candidate.applications[0]?.id);
        
        await prisma.scorecard.create({
            data: {
                candidateId: candidate.id,
                applicationId: candidate.applications[0]?.id,
                attributes: { tech: 4 },
                feedback: "testing",
                score: 4,
                recommendation: "yes",
                interviewerId: user.id
            }
        });
        console.log("Success");
    } catch(err) {
        console.log("Error:", err.message);
    }
}
main();
