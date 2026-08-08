import { NextResponse } from "next/server";

import { postToApi } from "../../../lib/api";

/**
 * POST /api/resend — asks the API for a fresh verification link.
 *
 * The API answers identically whether or not the address exists, so this route
 * can pass the response straight through without leaking anything. A 429 (the
 * resend cool-down) is the one case the page renders differently.
 */
export async function POST(request: Request) {
    let email: unknown;
    try {
        email = ((await request.json()) as { email?: unknown }).email;
    } catch {
        email = null;
    }

    if (typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ message: "Enter the email address you signed up with." }, { status: 400 });
    }

    const result = await postToApi<{ message: string }>("/api/v1/auth/resend-verification", { email });

    return result.ok ? NextResponse.json(result.data) : NextResponse.json({ message: result.message, code: result.code }, { status: result.status });
}
