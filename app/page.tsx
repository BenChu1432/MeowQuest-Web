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
            <div className="emoji">🐱</div>
            <h1>Nothing to see here</h1>
            <p>This page is where the links in MeowQuest emails land. Open the link we sent you, or head back to the app.</p>
        </main>
    );
}
