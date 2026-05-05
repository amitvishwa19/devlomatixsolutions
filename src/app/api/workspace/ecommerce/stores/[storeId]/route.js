import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
}



export async function DELETE(request, { params }) {















  return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
}