import { useEffect } from "react";
import barba from "@barba/core";

export const useBarba = (): void => {
  useEffect(() => {
    // Initialize Barba
    barba.init({
      transitions: [
        {
          name: "slide-transition",
          leave(data) {
            const container = data.current.container;
            const wrapper = document.querySelector('[data-barba="wrapper"]');

            // Create white overlay for transition (sliding from right to left)
            if (wrapper) {
              const overlay = document.createElement("div");
              overlay.classList.add(
                "absolute",
                "inset-0",
                "z-30",
                "bg-white",
                "translate-x-full"
              );
              wrapper.appendChild(overlay);

              void overlay.offsetHeight;

              // Animate white overlay from right to center
              overlay.classList.add(
                "transition-transform",
                "duration-700",
                "ease-in-out",
                "translate-x-0"
              );
            }

            // Fade out current content
            container.classList.add(
              "transition-opacity",
              "duration-500",
              "opacity-0"
            );

            return new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 700);
            });
          },
          enter(data) {
            const container = data.next.container;
            const wrapper = document.querySelector('[data-barba="wrapper"]');
            const overlay = wrapper?.querySelector("div.absolute");

            // Setup initial state for new page
            container.classList.add("opacity-0", "translate-x-full");

            // Start animation sequence
            setTimeout(() => {
              // Move overlay out to the left and remove
              if (overlay) {
                overlay.classList.replace(
                  "translate-x-0",
                  "translate-x-[-100%]"
                );
                setTimeout(() => {
                  overlay.remove();
                }, 700);
              }

              // Animate container from right
              container.classList.remove("opacity-0", "translate-x-full");
              container.classList.add(
                "transition-all",
                "duration-700",
                "ease-out",
                "translate-x-0"
              );
            }, 100);

            return Promise.resolve();
          },
        },
      ],
    });

    // No need for initial animation as we're using Tailwind animations
    // directly in the component JSX

    // Clean up
    return () => {
      barba.destroy();
    };
  }, []);
};

export default useBarba;
