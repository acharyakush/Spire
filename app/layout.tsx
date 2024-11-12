import type { Metadata } from "next";
import { PrimeReactProvider } from "primereact/api";

import "./globals.css";
import "primereact/resources/themes/lara-dark-blue/theme.css";

export const metadata: Metadata = {
  title: "Welcome | Spire",
  description: "Developed, owned and maintained by and for Signiix Advisors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrimeReactProvider
          value={{
            inputStyle: "outlined",
            ripple: true,
          }}
        >
          {children}
        </PrimeReactProvider>
      </body>
    </html>
  );
}
