import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StageWiseToolbar from "@/components/StageWiseToolbar";
import { VOStatusProvider } from "@/contexts/VOStatusContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flow Wireframes",
  description: "Interactive feature wireframes for Flow healthcare system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <VOStatusProvider>
          <StageWiseToolbar />
          {children}
        </VOStatusProvider>
      </body>
    </html>
  );
}
