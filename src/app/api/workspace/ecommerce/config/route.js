import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";


export async function GET(request) {



    console.log('Get COnfig request')

    try {


        return NextResponse.json({ success: true, message: "Connection Successfull" }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
    }
}


