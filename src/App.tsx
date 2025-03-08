import { useEffect } from "react";
import peep25 from "./assets/peep-25.svg";
import barba from "@barba/core";

function App() {
  useEffect(() => {
    // Initialize Barba
    barba.init({
      transitions: [
        {
          name: "bubble-transition",
          leave(data) {
            const container = data.current.container;

            // Add Tailwind classes for exit animation
            container.classList.add(
              "transition-all",
              "duration-500",
              "opacity-0",
              "translate-y-full"
            );

            return new Promise((resolve) => {
              setTimeout(resolve, 500);
            });
          },
          enter(data) {
            const container = data.next.container;
            const img = container.querySelector("img");
            const heading = container.querySelector("h1");

            // Setup initial state with Tailwind classes
            container.classList.add("opacity-0", "translate-y-full");
            if (img) img.classList.add("scale-0", "opacity-0");
            if (heading) heading.classList.add("translate-y-full", "opacity-0");

            // Start animation sequence
            setTimeout(() => {
              container.classList.remove("opacity-0", "translate-y-full");
              container.classList.add("transition-all", "duration-500");

              setTimeout(() => {
                if (img) {
                  img.classList.remove("scale-0", "opacity-0");
                  img.classList.add(
                    "transition-all",
                    "duration-700",
                    "scale-100",
                    "opacity-100"
                  );
                  // Removed the bubble animation here
                }

                if (heading) {
                  heading.classList.remove("translate-y-full", "opacity-0");
                  heading.classList.add(
                    "transition-all",
                    "duration-700",
                    "translate-y-0",
                    "opacity-100"
                  );
                }
              }, 300);
            }, 50);

            return Promise.resolve();
          },
        },
      ],
    });

    // Initial page load animation
    const doInitialAnimation = () => {
      const container = document.querySelector('[data-barba="container"]');
      const img = container?.querySelector("img");
      const heading = container?.querySelector("h1");

      if (img && heading) {
        // Set initial state
        img.classList.add("scale-0", "opacity-0");
        heading.classList.add("translate-y-full", "opacity-0");

        // Trigger animation
        setTimeout(() => {
          img.classList.remove("scale-0", "opacity-0");
          img.classList.add(
            "transition-all",
            "duration-700",
            "scale-100",
            "opacity-100"
          );
          // Removed the bubble animation here

          heading.classList.remove("translate-y-full", "opacity-0");
          heading.classList.add(
            "transition-all",
            "duration-700",
            "translate-y-0",
            "opacity-100"
          );
        }, 300);
      }
    };

    doInitialAnimation();
  }, []);

  return (
    <div
      data-barba="wrapper"
      className="h-screen w-full grid place-items-center overflow-hidden bg-bgblack"
    >
      <div
        data-barba="container"
        data-barba-namespace="work-in-progress"
        className="container h-full w-full flex flex-col items-center justify-center transition-all duration-500"
      >
        <img
          src={peep25}
          alt=""
          className="w-40 sm:w-64 transition-all duration-700"
        />
        <h1 className="text-bgwhite text-4xl sm:text-7xl font-body mt-4 transition-all duration-700">
          Work In Progress
        </h1>
      </div>
    </div>
  );
}

export default App;
