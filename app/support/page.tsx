import type { Metadata } from "next";

/**
 * The support page — the URL handed to the App Store as the app's "Support URL".
 *
 * Apple requires a publicly reachable page where users can contact the
 * developer, so this is deliberately plain: who we are, how to get in touch,
 * and the few questions people actually ask. It is static — no token, no state —
 * because it has to open on a stuck student's phone, in any browser, on the
 * first try.
 */

export const metadata: Metadata = {
    title: "Support — MeowMeowQuest",
    description: "Help and contact information for MeowMeowQuest.",
    // Unlike the email-verification pages (which carry single-use tokens and are
    // hidden from search), this one is meant to be found. It is what App Store
    // review opens when it checks the "Support URL" field.
    robots: { index: true, follow: true },
};

/**
 * Where support email actually lands. `support@meowquest.app` is a real, checked
 * mailbox, so the "Email us" button below reaches a human rather than a void.
 */
const SUPPORT_EMAIL = "support@meowquest.app";

const FAQ = [
    {
        question: "I can't sign in, or I'm locked out.",
        answer:
            "Tap the password-reset link on the sign-in screen and we'll email you a way back in. If that email doesn't arrive, check your spam folder — or write to us and we'll sort it out.",
    },
    {
        question: "I found a bug, or something isn't working.",
        answer:
            "Tell us what you were doing, what you expected, and what happened instead. Your device (iPhone, iPad, or Android) and a screenshot make it much easier to fix.",
    },
    {
        question: "I want to delete my account or my data.",
        answer:
            "Email us from the address on your account and we'll remove it. Students should ask a parent or teacher to write in for them.",
    },
    {
        question: "I'm a teacher and I need help with my class.",
        answer:
            "Email us with your school and the class you're asking about. We'll help with missions, assignments, and reading your class results.",
    },
] as const;

export default function SupportPage() {
    return (
        <main className="card support">
            <p className="brand">MEOWQUEST</p>
            <img className="mascot" src="/mascot.svg" alt="Blu the cat" />
            <h1>MeowMeowQuest support</h1>
            <p className="lead">Need a hand with MeowMeowQuest? We&rsquo;re here to help.</p>

            <a className="button" href={`mailto:${SUPPORT_EMAIL}`}>
                Email us
            </a>

            <section>
                <h2>Frequently asked questions</h2>
                {FAQ.map(({ question, answer }) => (
                    <div key={question}>
                        <h3>{question}</h3>
                        <p>{answer}</p>
                    </div>
                ))}
            </section>

            <p className="note">
                MeowMeowQuest is an English-learning game where you complete quests, keep your
                streak, and level up with Blu the cat.
            </p>
            <p className="note">
                <a className="link" href="/privacy">Privacy Policy</a>
            </p>
        </main>
    );
}
