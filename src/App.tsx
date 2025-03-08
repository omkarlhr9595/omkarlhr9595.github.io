import { useEffect, useState } from "react";
import peep25 from "./assets/peep-25.svg";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full grid place-items-center overflow-hidden bg-black">
      <div className="container h-full w-full flex flex-col items-center justify-center">
        <div className={`transition-transform duration-1000 ease-out ${isLoading ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          <img 
            src={peep25} 
            alt="" 
            className={`w-40 sm:w-64 transition-all duration-700 ${isLoading ? 'scale-0' : 'scale-100 animate-bubble'}`} 
          />
        </div>
        <h1 
          className={`text-bgwhite text-4xl sm:text-7xl font-body mt-4 transition-all duration-1000 delay-300 ${isLoading ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          Work In Progress
        </h1>
      </div>
    </div>
  );
}

export default App;