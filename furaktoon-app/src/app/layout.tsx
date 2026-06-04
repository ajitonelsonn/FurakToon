import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PendoInit from "@/components/PendoInit";
import { createClient } from "@/lib/supabase/server";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FurakToon — Beautiful cartoons, made by you",
  description:
    "Generate stunning anime and cartoon images with AI. FurakToon (furak = beautiful in Tetum) lets you create unique characters and scenes in seconds.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FFFBF5] text-[#1A1A2E] font-sans antialiased">
        <Script
          id="pendo-snippet"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('${process.env.NEXT_PUBLIC_PENDO_API_KEY ?? 'c3855ea6-033e-445c-ad72-0fefdadf7297'}');
            `,
          }}
        />

        <PendoInit user={user} />
        <Navbar user={user} />

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
          <p>
            <span className="font-semibold text-fuchsia-500">FurakToon</span> —{" "}
            <em>furak</em> means &ldquo;beautiful&rdquo; in Tetum ·{" "}
            <a
              href="https://www.mindtheproduct.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Mind the Product Hackathon 2026
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
