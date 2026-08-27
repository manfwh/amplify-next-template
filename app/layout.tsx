import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import ConfigureAmplifyClientSide from "./ConfigureAmplifyClientSide";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My todos",
  description: "Amplify Gen2 todo app",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
