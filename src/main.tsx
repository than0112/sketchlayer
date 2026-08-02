import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App";
import "./styles.css";

const ProDemo = lazy(() => import("./ProDemo"));

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    {window.location.hash === "#pro" ? <Suspense fallback={null}><ProDemo /></Suspense> : <App />}
  </StrictMode>,
);
