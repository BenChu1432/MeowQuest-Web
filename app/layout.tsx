import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

/**
 * The MeowQuest web app.
 *
 * Its whole purpose is to be the other end of a link in an email: someone taps
 * "Verify my email" in Gmail on a phone and lands here. That shapes everything —
 * one card, one button, no navigation, and no assumption that the visitor has
 * the mobile app open or has ever seen a browser tab before.
 */
export const metadata: Metadata = {
    title: "MeowQuest",
    description: "Verify your MeowQuest email and start your adventure.",
    // These pages are reached with a single-use token in the URL. Keeping them
    // out of search results is the bare minimum.
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0AA9E8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
