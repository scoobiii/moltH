import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import YaiLanding from "./YaiLanding.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { FirebaseProvider } from "./context/FirebaseContext.tsx";
import "./index.css";

function RootApp() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/" ? <YaiLanding /> : <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <FirebaseProvider>
        <RootApp />
      </FirebaseProvider>
    </ToastProvider>
  </StrictMode>
);
