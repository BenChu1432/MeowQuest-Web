import { NextResponse } from "next/server";

import { postToApi } from "../../../lib/api";

/**
 * POST /api/verify — forwards a verification token to the API.
 *
 * Same-origin from the browser's point of view, which keeps the API's address
 * out of the page and sidesteps CORS entirely.
 */
export async function POST(request: Request) {
    let token: unknown;
    try {
        token = ((await request.json()) as { token?: unknown }).token;
    } catch {
        token = null;
    }

    if (typeof token !== "string" || token.length === 0) {
        return NextResponse.json({ message: "That link is missing its verification code." }, { status: 400 });
    }

    const result = await postToApi<{ email: string; verified: boolean }>("/api/v1/auth/verify-email", { token });

    return result.ok ? NextResponse.json(result.data) : NextResponse.json({ message: result.message, code: result.code }, { status: result.status });
}
