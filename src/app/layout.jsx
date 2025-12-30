import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Custom font - Add your TTF files to src/assets/fonts/
const customFont = localFont({
  src: [
    {
      path: "../assets/fonts/Peyda-Regular.ttf",
      weight: "400",
      style: "normal",
    },
   
  ],
  variable: "--font-custom",
});

export const metadata = {
  title: "صنف من",
  description: "پلتفرم کسب و کار",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
