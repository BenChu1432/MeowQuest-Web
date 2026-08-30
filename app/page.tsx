/**
 * The root of the web app.
 *
 * Nobody is meant to arrive here — every real visit carries a token and lands on
 * `/verify`. This exists so that someone who trims the URL back to the domain,
 * or a monitoring check hitting `/`, gets a friendly page instead of a 404.
 */
export default function HomePage() {
    return (
        <main className="card">
            <p className="brand">MEOWQUEST</p>
            <img className="mascot" src="/mascot.svg" alt="Blu the cat" />
            <h1>Nothing to see here</h1>
            <p>This page is where the links in MeowMeowQuest emails land. Open the link we sent you, or head back to the app.</p>
            <p className="note">
                <a className="link" href="/support">Support</a>
                {" · "}
                <a className="link" href="/privacy">Privacy Policy</a>
            </p>
        </main>
    );
}
