import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "DeAI",
  description: "The decentralized AI network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}