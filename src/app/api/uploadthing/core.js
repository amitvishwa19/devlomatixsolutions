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
        .onUploadComplete(() => { })
};

