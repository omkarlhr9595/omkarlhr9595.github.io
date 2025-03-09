import { Link } from "react-router-dom";
import { JSX } from "react";
import peep25 from "../assets/peep-25.svg";
import Transition from "../hooks/Transition";

function Home(): JSX.Element {
  return (
    <div className="container h-full w-full flex flex-col items-center justify-center z-20">
      <img src={peep25} alt="" className="w-40 sm:w-64 animate-bubble" />
      <h1 className="text-bgwhite text-4xl sm:text-7xl font-body mt-4 text-center animate-slide-up">
        Work In Progress
      </h1>
      <Link
        to="/projects"
        className="mt-8 px-6 py-3 rounded-full text-lg text-white font-body opacity-0 animate-[fadeIn_0.7s_ease-out_0.5s_forwards] border border-gray-700 hover:border-gray-500 transition-colors duration-300"
      >
        View My Projects
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <Transition>
      <Home />
    </Transition>
  );
}
