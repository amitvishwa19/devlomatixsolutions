import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req) => ({ id: "fakeId" }); // Fake auth function

const handleAuth = () => {
    const userId = 'userId'


    if (!userId) throw new Error('User not authenticated')
    return { userId: userId }
}


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {

    serverImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),

    messageFile: f(['image', 'pdf'])
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),

    documentUploader: f(["image", "pdf", "text", "blob"])
        .middleware(() => handleAuth())
        .onUploadComplete(({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL", file.url);
            return { uploadedBy: metadata.userId };
        }),

    resumeUploader: f({ 
        pdf: { maxFileSize: '5MB', maxFileCount: 1 },
        doc: { maxFileSize: '5MB', maxFileCount: 1 },
        docx: { maxFileSize: '5MB', maxFileCount: 1 }
    })
        .middleware(() => ({ userId: "public_applicant" })) // Allow public uploads for resumes
        .onUploadComplete(({ file }) => {
            console.log("Resume upload complete:", file.url);
            return { fileUrl: file.url };
        }),
};

