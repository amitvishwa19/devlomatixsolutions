const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const candidate = await prisma.candidate.findFirst();
        if(!candidate) {
            console.log("No candidates");
            return;
        }
        console.log("Candidate:", candidate.id);
        const user = await prisma.user.findFirst();
        console.log("User:", user.id);

        await prisma.scorecard.create({
            data: {
                candidateId: candidate.id,
                attributes: {"tech": 4},
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
