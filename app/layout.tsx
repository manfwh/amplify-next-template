import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ViewTransition } from "react";
import "./app.css";
import ConfigureAmplifyClientSide from "./ConfigureAmplifyClientSide";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amplify Next 16.3 demo",
  description: "Todos plus a Cache Components feed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        <Providers>
          <div className="app-shell">
            <header className="app-nav">
              <Link href="/">Todos</Link>
              <Link href="/feed" prefetch={true}>
                Feed
              </Link>
            </header>
            <main className="app-main">
              <ViewTransition>{children}</ViewTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
