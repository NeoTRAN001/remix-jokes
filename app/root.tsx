import type { LinksFunction } from "remix"; 
import { LiveReload, Outlet, Links, Scripts } from 'remix';

import globalStylesUrl from "./styles/global.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalLargeStylesUrl from "./styles/global-large.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: globalMediumStylesUrl, media: "print, (min-width: 640px)" },
    { rel: "stylesheet", href: globalLargeStylesUrl, media: "screen and (min-width: 1024px)" }
  ];
}; 

export default function App() {
  return (
    <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <title>Remix: So great, it´s funny!</title>
      <Links /> 
    </head>
    <body>
      <Outlet />
      <Scripts />
      {process.env.NODE_ENV === "development" ? (
        <LiveReload />
      ): null}
    </body>
    </html>
  );
}