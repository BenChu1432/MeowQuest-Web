/**
 * Server-side calls into the MeowQuest API.
 *
 * The browser never talks to the API directly. It calls this app's own
 * `/api/*` routes, which forward the request from the server — so the API's
 * origin stays private, and there is no CORS configuration to get wrong on a
 * page whose entire job is to work on the first try from a stranger's phone.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string; message: string };

function apiBase(): string {
    const base = process.env.API_URL;
    if (!base) throw new Error("API_URL is not set. Copy web/.env.example to web/.env.");
    return base.replace(/\/$/, "");
}

type ApiErrorBody = { error?: { code?: string; message?: string } };

export async function postToApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    let response: Response;

    // Resolved before the try, deliberately. A missing API_URL is a deployment
    // mistake, and letting it fall into the catch below would dress it up as
    // "the API is down" — sending someone off to retry a link that will never
    // work until a human edits a file.
    const url = `${apiBase()}${path}`;

    try {
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
        });
    } catch {
        // The API being unreachable is our problem, not the user's, and it is
        // worth distinguishing from "your link is invalid" — one is worth
        // retrying in a minute, the other never will be.
        return { ok: false, status: 503, code: "api_unreachable", message: "We can't reach MeowQuest right now. Please try again in a minute." };
    }

    const text = await response.text();
    let payload: unknown = null;
    try {
        payload = text ? JSON.parse(text) : null;
    } catch {
        /* A non-JSON body means something upstream is badly wrong; handled below. */
    }

    if (!response.ok) {
        const error = (payload as ApiErrorBody | null)?.error;
        return {
            ok: false,
            status: response.status,
            code: error?.code ?? "error",
            message: error?.message ?? "Something went wrong. Please try again.",
        };
    }

    return { ok: true, data: payload as T };
}
