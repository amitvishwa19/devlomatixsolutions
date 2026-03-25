import { jsPDF } from "jspdf";

/**
 * Generates a professional offer letter PDF
 * @param {Object} data - Candidate and Job data
 * @returns {jsPDF}
 */
export const generateOfferLetter = (data) => {
    const { 
        candidateName, 
        jobTitle, 
        salary, 
        startDate, 
        companyName = "Devlomatix Solutions",
        recruiterName = "The Hiring Team"
    } = data;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo Placeholder or Header text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary Color
    doc.text(companyName, margin, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 30);

    doc.setDrawColor(230);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Subject
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("OFFER OF EMPLOYMENT", margin, 50);

    // Salutation
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Dear ${candidateName},`, margin, 65);

    // Body
    const bodyText = `
We are pleased to offer you the position of ${jobTitle} at ${companyName}. 
Your expertise and vision align perfectly with our mission to build cutting-edge digital solutions. 

We are confident that you will be a valuable addition to our team and that you will contribute significantly to our continued success.

Employment Details:
    `;
    const splitBody = doc.splitTextToSize(bodyText, pageWidth - (margin * 2));
    doc.text(splitBody, margin, 75);

    // Details Grid
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, 105, pageWidth - (margin * 2), 40, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("Position:", margin + 5, 115);
    doc.setFont("helvetica", "normal");
    doc.text(jobTitle, margin + 50, 115);

    doc.setFont("helvetica", "bold");
    doc.text("Total Compensation:", margin + 5, 125);
    doc.setFont("helvetica", "normal");
    doc.text(salary || "As discussed", margin + 50, 125);

    doc.setFont("helvetica", "bold");
    doc.text("Target Start Date:", margin + 5, 135);
    doc.setFont("helvetica", "normal");
    doc.text(startDate || "TBD", margin + 50, 135);

    // Closing
    const closingText = `
Please indicate your acceptance of this offer by signing below and returning this document by ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.

We look forward to welcoming you to ${companyName}!
    `;
    const splitClosing = doc.splitTextToSize(closingText, pageWidth - (margin * 2));
    doc.text(splitClosing, margin, 155);

    // Signature
    doc.text("Sincerely,", margin, 185);
    doc.setFont("helvetica", "bold");
    doc.text(recruiterName, margin, 195);
    doc.setFont("helvetica", "normal");
    doc.text("Recruitment Division", margin, 200);

    doc.line(margin, 230, margin + 60, 230);
    doc.setFontSize(8);
    doc.text("Candidate Signature", margin, 235);

    return doc;
};
