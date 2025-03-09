import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { JSX } from "react";
import Projects from "./pages/Projects";
import Home from "./pages/Home";
import { AnimatePresence } from "framer-motion";

function App(): JSX.Element {
  return (
    <Router>
      <div className="h-screen w-full grid place-items-center overflow-hidden relative bg-bgblack">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
