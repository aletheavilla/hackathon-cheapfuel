export const metadata = {
  title: "CheapFuel - Find Cheap Gas Stations",
  description: "Find the cheapest gas stations near you",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

