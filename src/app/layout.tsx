import "./globals.css";
import { Inter } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wkwk Land",
  description: "Semua bisa bicara",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
    //   <html lang="en">
    //     <body className={inter.className}>{children}</body>
    //   </html>
    // </ClerkProvider>
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        {/* <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header> */}
        <main>
          {children}
        </main>
      </body>
    </html>
  </ClerkProvider>
  );
}
