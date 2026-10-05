import { NextResponse } from "next/server";

export function apiSuccess(data = {}, extra = {}, status = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
            ...extra
        },
        { status }
    );
}

export function apiError(message = "An error occurred", status = 400, details = null) {
    return NextResponse.json(
        {
            success: false,
            error: typeof message === 'string' ? message : message?.message || "Operation failed",
            ...(details ? { details } : {})
        },
        { status }
    );
}
