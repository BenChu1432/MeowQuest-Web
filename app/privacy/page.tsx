import type { Metadata } from "next";

/**
 * The privacy policy — the URL handed to the App Store as the app's "Privacy
 * Policy URL".
 *
 * Apple requires a publicly reachable page describing exactly what the app
 * collects and why, and this is it. It is deliberately plain and longer than
 * the rest of the app: the reader is a parent or a teacher checking before a
 * child plays, not a lawyer. Static — no token, no state — because App Store
 * review and a cautious parent both need it to open on the first try.
 */

export const metadata: Metadata = {
    title: "Privacy Policy — MeowMeowQuest",
    description: "How MeowMeowQuest collects, uses, and protects your information.",
    // Like the support page, this one is meant to be found — App Store review
    // opens it from the "Privacy Policy URL" field.
    robots: { index: true, follow: true },
};

/** Where privacy questions actually land. Same checked mailbox as Support. */
const SUPPORT_EMAIL = "lucchu1007@gmail.com";

export default function PrivacyPage() {
    return (
        <main className="card legal">
            <p className="brand">MEOWQUEST</p>
            <img className="mascot" src="/mascot.svg" alt="Blu the cat" />
            <h1>MeowMeowQuest privacy policy</h1>
            <p className="lead">
                How we collect, use, and protect your information — written to be read by a parent or teacher, not just a lawyer.
            </p>
            <p className="effective-date">Effective: 30 August 2026</p>

            <section>
                <h2>The short version</h2>
                <ul>
                    <li>We collect only what the game needs to work — your account, your progress, and your class if a teacher adds you.</li>
                    <li>We never sell your information, and we show no advertising.</li>
                    <li>You can delete your account and its data from inside the app, at any time.</li>
                    <li>We treat children's data with extra care; teachers and schools act on a child's behalf.</li>
                </ul>
            </section>

            <section>
                <h2>Who we are</h2>
                <p>
                    MeowMeowQuest is an English-learning game where you complete quests, keep your streak, and level up with Blu the cat. It is used by students (called Adventurers) and by the teachers (called Guild Masters) who set their work.
                </p>
                <p>
                    Questions about this policy? Email <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </p>
            </section>

            <section>
                <h2>Information we collect</h2>
                <h3>Account information</h3>
                <p>
                    Your email address; your password, stored as a one-way hash we cannot read; your role — Adventurer or Guild Master; and, if you choose, your gender.
                </p>
                <h3>Profile information</h3>
                <p>
                    Your display name, the name or class number your teacher files you under (your alias), and your hero — the colour and look you build in the wardrobe.
                </p>
                <h3>Learning data</h3>
                <p>
                    The quests you complete, your answers (right and wrong), and the progress that comes from them: XP, gems, levels, and streaks.
                </p>
                <h3>Speaking practice</h3>
                <p>
                    Speaking quests use your device's microphone. Your device's built-in speech recognition turns what you say into text so the app can score your pronunciation. We store the result, not a recording of your voice.
                </p>
                <h3>Class and community data</h3>
                <p>
                    When a teacher adds you to a class, we store the class itself, your membership, the assignments, and the progress the teacher can see for their own students. Community features — friends, friend streaks, brag posts, and likes — are stored only if you choose to use them.
                </p>
            </section>

            <section>
                <h2>How we use your information</h2>
                <ul>
                    <li>To run the game: quests, streaks, levels, rewards, and the review of mistakes.</li>
                    <li>To let teachers assign work and see their own class's progress.</li>
                    <li>To send account emails: verification links and password resets.</li>
                    <li>To keep accounts secure and to fix problems.</li>
                </ul>
            </section>

            <section>
                <h2>Who we share information with</h2>
                <p>We share information only with the services that run MeowMeowQuest, and only as much as each needs:</p>
                <ul>
                    <li>Amazon Web Services — hosting and the database, in the Asia Pacific (Singapore) region.</li>
                    <li>Google — the Gmail API that sends our emails.</li>
                    <li>Apple and Google — the app stores that distribute MeowMeowQuest; their own privacy policies apply to your download.</li>
                </ul>
                <p>We do not sell or rent personal information, and we do not share it with advertisers or data brokers.</p>
            </section>

            <section>
                <h2>Children's privacy</h2>
                <p>
                    MeowMeowQuest is designed to be used by children, usually under a teacher or school. Teachers and schools are responsible for obtaining any consent that applies when they act on a child's behalf. We show children no advertising, and we do not track them across the web for advertising.
                </p>
                <p>
                    Parents can ask us to review, correct, or delete a child's information at any time by writing to <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </p>
            </section>

            <section>
                <h2>Keeping and deleting your data</h2>
                <p>
                    You can delete your account from inside the app (Settings → Delete account, then re-enter your password). This removes your account and everything attached to it — progress, streaks, avatar, and friends.
                </p>
                <p>
                    A few records belong to a class rather than to one person, so they are kept but anonymised: a quest a teacher wrote, or a "someone liked your streak" line, survives with your name removed so a whole class is not broken by one deletion. For the same reason, a Guild Master must remove their students from a class before deleting their own account.
                </p>
                <p>
                    You can also email <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to delete your data or ask for a copy of it. Students should ask a parent or teacher to write in for them.
                </p>
            </section>

            <section>
                <h2>Security</h2>
                <p>
                    Passwords are stored as one-way hashes, traffic is encrypted in transit, and access is limited to the people who need it. No method of transmission or storage is completely secure, but we work to protect your information.
                </p>
            </section>

            <section>
                <h2>Your rights</h2>
                <p>
                    MeowMeowQuest currently serves customers in Hong Kong, and Hong Kong's Personal Data (Privacy) Ordinance (PDPO) applies. Under it, you may have the right to access, correct, or delete your information, and to receive a copy of it. Write to <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will help.
                </p>
            </section>

            <section>
                <h2>Where your data lives</h2>
                <p>
                    We host on Amazon Web Services in Singapore, and your information is stored there. Sending email happens with Google, which may process that data outside Singapore under the safeguards that service provides.
                </p>
            </section>

            <section>
                <h2>Changes to this policy</h2>
                <p>
                    We update this policy from time to time; the date at the top shows the current version. If a change matters, we will say so in the app or by email.
                </p>
            </section>

            <section>
                <h2>Contact us</h2>
                <p>
                    Email <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or see the <a className="link" href="/support">support page</a>.
                </p>
            </section>

            <p className="note">
                <a className="link" href="/support">Support</a>
                {" · "}
                <a className="link" href="/">Home</a>
            </p>
        </main>
    );
}
