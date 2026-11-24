import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { FigmaMobileApp } from "./figma/FigmaMobileApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <FigmaMobileApp brand="UN" />
      <Toaster position="top-center" richColors theme="light" />
    </TooltipProvider>
  </React.StrictMode>,
);
