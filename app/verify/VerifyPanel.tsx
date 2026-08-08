"use client";

import { useState } from "react";

/**
 * The verification interaction.
 *
 * Four states, and every one of them ends with something the visitor can
 * actually do:
 *
 *   ready    — a token is present; one big button confirms it.
 *   done     — verified; offer a jump back into the app.
 *   failed   — expired, already used, or missing; offer a new link.
 *   resent   — a new link is on its way.
 *
 * A dead end ("Invalid token.") is the failure mode worth designing against
 * here: the person reading it is a child who cannot sign in, and the only way
 * out is a fresh email.
 */

type Status = "ready" | "working" | "done" | "failed" | "resent";

const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME ?? "meowquest://";

export function VerifyPanel({ token }: { token: string | null }) {
    // A visit with no token skips straight to the recovery path — there is
    // nothing to confirm, so asking them to press "Verify" would be a lie.
    const [status, setStatus] = useState<Status>(token ? "ready" : "failed");
    const [message, setMessage] = useState<string>(token ? "" : "That link looks incomplete. Ask for a new one and open it straight from your email.");
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    async function verify(): Promise<void> {
        setBusy(true);
        setStatus("working");

        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const payload = (await response.json()) as { email?: string; message?: string };

            if (response.ok) {
                setVerifiedEmail(payload.email ?? null);
                setStatus("done");
            } else {
                setMessage(payload.message ?? "That link is no longer valid.");
                setStatus("failed");
            }
        } catch {
            setMessage("We couldn't reach MeowQuest. Check your connection and try again.");
            setStatus("failed");
        } finally {
            setBusy(false);
        }
    }

    async function resend(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        setBusy(true);

        try {
            const response = await fetch("/api/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const payload = (await response.json()) as { message?: string };

            if (response.ok) {
                setStatus("resent");
            } else {
                // 429 is the cool-down and carries a "wait 42s" message worth showing verbatim.
                setMessage(payload.message ?? "We couldn't send that. Try again in a moment.");
            }
        } catch {
            setMessage("We couldn't reach MeowQuest. Check your connection and try again.");
        } finally {
            setBusy(false);
        }
    }

    if (status === "done") {
        return (
            <>
                <div className="emoji">🎉</div>
                <h1>You&rsquo;re all set!</h1>
                <p>Head back to MeowQuest and sign in — your adventure is waiting.</p>
                {/* <a className="button" href={APP_SCHEME}>
                    Open MeowQuest
                </a> */}
                {/* The deep link silently does nothing on a desktop browser, or on a
                    phone without the app installed, so never let it be the only
                    instruction on the page. */}
            </>
        );
    }

    if (status === "resent") {
        return (
            <>
                <div className="emoji">📬</div>
                <h1>Check your inbox</h1>
                <p>
                    If <span className="email">{email}</span> needs verifying, a new link is on its way. It is good for 24 hours.
                </p>
                <p className="note">Nothing after a minute or two? Have a look in your spam folder.</p>
            </>
        );
    }

    if (status === "failed") {
        return (
            <>
                <div className="emoji">😿</div>
                <h1>That link didn&rsquo;t work</h1>
                <p className="error">{message}</p>
                <p>Type your email below and we&rsquo;ll send a fresh one.</p>

                <form onSubmit={resend}>
                    <input
                        className="field"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        disabled={busy}
                        aria-label="Email address"
                    />
                    <button className="button" type="submit" disabled={busy || !email.includes("@")}>
                        {busy ? "Sending…" : "Send me a new link"}
                    </button>
                </form>
            </>
        );
    }

    return (
        <>
            <div className="emoji">✉️</div>
            <h1>Verify your email</h1>
            <p>One tap and your MeowQuest account is ready to go.</p>
            <button className="button" type="button" onClick={verify} disabled={busy}>
                {busy ? "Verifying…" : "Verify my email"}
            </button>
        </>
    );
}
