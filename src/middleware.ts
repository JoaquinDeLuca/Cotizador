import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("access_token");

    // Si no hay token → al login
    if (!token) {
        console.warn("No token found, redirecting to login");
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
        await jwtVerify(token.value, secret);

        return NextResponse.next();
    } catch (error) {
        console.error("Invalid or expired token:", error);
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }
}

export const config = {
    matcher: ['/home'],
}