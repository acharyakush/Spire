import "./globals.css";
import { Provider } from "@/components/ui/provider";

export const metadata = {
  title: "Welcome | Spire",
  description: "Developed, owned and maintained by and for Signiix Advisors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
