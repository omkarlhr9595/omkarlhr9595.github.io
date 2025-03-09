import { Routes, Route, useLocation } from "react-router-dom";
import { JSX } from "react";
import HomePage from "./pages/Home";
import ProjectsPage from "./pages/Projects";
import { AnimatePresence } from "framer-motion";

function App(): JSX.Element {
  const location = useLocation();
  return (
    <div className="h-screen w-full grid place-items-center overflow-hidden relative bg-black">
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route index path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
