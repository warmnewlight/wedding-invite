import type { Metadata } from "next";
// Import a fancy font for the wax seal (Cinzel Decorative) and a standard serif (Playfair Display)
import { Playfair_Display, Cinzel_Decorative } from "next/font/google";
import "./globals.css";

// Primary Serif Font for the site
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif', // We can use this variable in Tailwind
});

// Ornate font specifically for the Wax Seal
const cinzel = Cinzel_Decorative({
  weight: "900",
  subsets: ["latin"],
  variable: '--font-seal',
});

// 🟢 UPDATE METADATA HERE
export const metadata: Metadata = {
  title: "Alicia & Daniel's Wedding",
  description: "Join us in celebrating our special day. September 19, 2026.",
  // To change the icon, replace the 'favicon.ico' in your /public folder with your own!
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Add both font variables to the body tag */}
      <body className={`${playfair.variable} ${cinzel.variable} font-serif`}>
        {children}
      </body>
    </html>
  );
}