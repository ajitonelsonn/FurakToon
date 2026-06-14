import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PendoInit from "@/components/PendoInit";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme/context";
import { createClient } from "@/lib/supabase/server";

// Sora — geometric, friendly display face for headings & brand.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Inter — clean, highly readable body text.
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${sora.variable} ${inter.variable} h-full`}>
      <head>
        {/* Anti-flash: set the theme class before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="relative min-h-full flex flex-col font-sans antialiased app-bg">
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
        <ThemeProvider>
        <I18nProvider>
          <Navbar user={user} />

          <main className="flex-1 flex flex-col">{children}</main>

          <footer className="relative py-7 text-center text-xs text-navy/50 border-t border-navy/10 bg-white/40 backdrop-blur-sm">
          <p>
            <span className="font-display font-bold text-navy">
              Furak<span className="text-sky">Toon</span>
            </span>{" "}
            ·{" "}
            <em>furak</em> means &ldquo;beautiful&rdquo; in Tetum 🇹🇱 ·{" "}
            <a
              href="https://www.mindtheproduct.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky transition-colors font-medium"
            >
              Mind the Product Hackathon 2026
            </a>
          </p>
          </footer>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
