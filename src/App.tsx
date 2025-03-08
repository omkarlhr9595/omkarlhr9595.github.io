import { useEffect } from "react";
import peep25 from "./assets/peep-25.svg";
import barba from "@barba/core";

function App() {
  useEffect(() => {
    // Initialize Barba
    barba.init({
      transitions: [
        {
          name: "droplet-transition",
          leave(data) {
            const container = data.current.container;
            const wrapper = document.querySelector('[data-barba="wrapper"]');

            // Add null check
            if (wrapper) {
              // Add white background overlay
              const overlay = document.createElement("div");
              overlay.classList.add(
                "absolute",
                "inset-0",
                "z-10",
                "scale-0",
                "rounded-full"
              );
              wrapper.appendChild(overlay);

              void overlay.offsetHeight;

              // Animate overlay to cover screen
              overlay.classList.add(
                "transition-transform",
                "duration-700",
                "ease-in-out",
                "scale-[200]",
                "origin-center"
              );
            }

            // Fade out content
            container.classList.add(
              "transition-opacity",
              "duration-500",
              "opacity-0"
            );

            return new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 700);
            });
          },
          enter(data) {
            const container = data.next.container;
            const wrapper = document.querySelector('[data-barba="wrapper"]');
            const img = container.querySelector("img");
            const heading = container.querySelector("h1");
            const overlay = wrapper?.querySelector("div.absolute");

            // Setup initial state
            container.classList.add(
              "opacity-0",
              "translate-y-full",
              "scale-90"
            );
            if (img) img.classList.add("scale-0", "opacity-0");
            if (heading) heading.classList.add("translate-y-full", "opacity-0");

            // Start animation sequence
            setTimeout(() => {
              // Remove overlay with transition
              if (overlay) {
                overlay.classList.replace("scale-[200]", "scale-0");
                setTimeout(() => {
                  overlay.remove();
                }, 700);
              }

              // Animate container
              container.classList.remove(
                "opacity-0",
                "translate-y-full",
                "scale-90"
              );
              container.classList.add(
                "transition-all",
                "duration-700",
                "ease-out"
              );

              // Animate elements with delay
              setTimeout(() => {
                if (img) {
                  img.classList.remove("scale-0", "opacity-0");
                  img.classList.add(
                    "transition-all",
                    "duration-700",
                    "scale-100",
                    "opacity-100"
                  );
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
            }, 100);

            return Promise.resolve();
          },
        },
      ],
    });

    // Initial page load animation with white background
    const doInitialAnimation = () => {
      const wrapper = document.querySelector('[data-barba="wrapper"]');
      const container = document.querySelector('[data-barba="container"]');
      const img = container?.querySelector("img");
      const heading = container?.querySelector("h1");

      // Add null check for container
      if (container) {
        // Set initial state
        container.classList.add("opacity-0", "translate-y-full", "scale-90");

        // Trigger animation sequence
        setTimeout(() => {
          // Change background
          if (wrapper) {
            wrapper.classList.add("transition-colors", "duration-700");
          }

          // Animate container
          container.classList.remove(
            "opacity-0",
            "translate-y-full",
            "scale-90"
          );
          container.classList.add("transition-all", "duration-700", "ease-out");

          setTimeout(() => {
            if (img) {
              img.classList.remove("scale-0", "opacity-0");
              img.classList.add(
                "transition-all",
                "duration-700",
                "scale-100",
                "opacity-100"
              );
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
        }, 300);
      }
    };

    doInitialAnimation();
  }, []);

  return (
    <div
      data-barba="wrapper"
      className="h-screen w-full grid place-items-center overflow-hidden relative"
    >
      <div
        data-barba="container"
        data-barba-namespace="work-in-progress"
        className="container h-full w-full flex flex-col items-center justify-center z-20"
      >
        <img src={peep25} alt="" className="w-40 sm:w-64" />
        <h1 className="text-bgwhite text-4xl sm:text-7xl font-body mt-4">
          Work In Progress
        </h1>
      </div>
    </div>
  );
}

export default App;
