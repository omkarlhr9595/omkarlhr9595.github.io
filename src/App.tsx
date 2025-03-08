import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { JSX } from "react";
import Projects from "./pages/Projects";
import Home from "./pages/Home";

function App(): JSX.Element {
  return (
    <Router>
      <div
        data-barba="wrapper"
        className="h-screen w-full grid place-items-center overflow-hidden relative bg-bgblack"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
