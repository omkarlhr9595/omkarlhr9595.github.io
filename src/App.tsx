import { Routes, Route, useLocation } from "react-router-dom";
import { JSX } from "react";
import Projects from "./pages/Projects";
import Home from "./pages/Home";
import { AnimatePresence } from "framer-motion";

function App(): JSX.Element {
  const location = useLocation();
  return (
    <div className="h-screen w-full grid place-items-center overflow-hidden relative bg-black">
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route index path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
