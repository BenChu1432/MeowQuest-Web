import type { Metadata } from "next";

import { VerifyPanel } from "./VerifyPanel";

export const metadata: Metadata = { title: "Verify your email — MeowQuest" };

/**
 * Where the verification link lands.
 *
 * The token is read here, on the server, and handed to a client component that
 * does the actual verifying — deliberately *not* on page load.
 *
 * Mail providers and corporate security tools routinely fetch every link in an
 * incoming message to scan it. If a GET to this page verified the account, those
 * scanners would burn the single-use token before the child ever tapped it, and
 * the real click would land on "this link is no longer valid". Requiring a
 * button press makes the destructive step a genuine user action, which is also
 * why the API only accepts it over POST.
 */
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyPage({ searchParams }: Props) {
    const token = (await searchParams).token ?? null;

    return (
        <main className="card">
            <p className="brand">MEOWQUEST</p>
            <VerifyPanel token={token} />
        </main>
    );
}
