import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";


export async function GET(request, { params }) {

    const { appIdentifier } = await params;
    let decryptedApiKey
    let store

    try {
        const configData = await db.ecommerceConfig.findFirst({
           where:{
            appIdentifier:appIdentifier
           }
        })

       
        if (!configData) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
        }

       

        if(configData){
            decryptedApiKey = symmetricDecrypt(configData?.apiKey); 
           if(!decryptedApiKey){
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
           }
        }

         
        console.log('configData-apikey',configData.apiKey)
        console.log('decryptedApiKey',decryptedApiKey)


        // if(!store){
        //     return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
        // }

        // if(store.status !== 'connected'){
        //     return NextResponse.json({ success: false, message: "Store is not connected" }, { status: 403 });
        // }



        return NextResponse.json({ success: true, message: "Connection Successfull", config: configData }, { status: 202 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
    }
}


export async function POST(request, { params }) {

    
    try {
        




        

        return NextResponse.json({ success: true, message: "Connection Successfull" }, { status: 202 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
    }
}