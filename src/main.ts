import "./index.css";
import barba from "@barba/core";
import { gsap } from "gsap";

const bulgeHeight = () => (window.innerWidth > 540 ? "10vh" : "5vh");

const PAGE_NAMES: Record<string, string> = {
  home: "Home",
  projects: "Projects",
};

function setLoadingWord(namespace: string) {
  const word = document.querySelector(".loading-words h2.page-word");
  if (word) word.textContent = PAGE_NAMES[namespace] ?? "";
}

function coverScreen(): Promise<void> {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });

    tl.set(".loading-screen", { top: "100%" });
    tl.set(".rounded-div-wrap.top", { height: 0 });
    tl.set(".loading-words", { opacity: 0 });
    tl.set(".loading-words h2.page-word", { y: 0 });

    tl.to(".loading-screen", { top: "0%", duration: 0.5, ease: "power4.in" });
    tl.to(
      ".rounded-div-wrap.top",
      { height: bulgeHeight(), duration: 0.4, ease: "power4.in" },
      "<"
    );
    tl.set(".rounded-div-wrap.top", { height: 0 });
  });
}

// Mirrors the reference's pageTransitionIn tail: the curtain's exit slide
// starts before the word's fade-in/rise finishes, and the word's fade-out
// overlaps the start of that slide instead of waiting for it.
function revealScreen(): Promise<void> {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    const bh = bulgeHeight();

    tl.set(".rounded-div-wrap.bottom", { height: bh });

    tl.to(".loading-words", { opacity: 1, duration: 0.8, ease: "power4.out", delay: 0.05 });
    tl.to(".loading-words h2.page-word", { y: -50, duration: 0.8, ease: "power4.out", delay: 0.05 }, "<");

    tl.to(".loading-screen", { top: "-100%", duration: 0.8, ease: "power3.inOut" }, "-=0.2");
    tl.to(".loading-words", { opacity: 0, duration: 0.6, ease: "none" }, "-=0.8");
    tl.to(".rounded-div-wrap.bottom", { height: 0, duration: 0.85, ease: "power3.inOut" }, "-=0.6");

    tl.set(".loading-screen", { top: "100%" });
    tl.set(".rounded-div-wrap.bottom", { height: bh });
    tl.set(".loading-words", { opacity: 0 });
    tl.set(".loading-words h2.page-word", { y: 0 });
  });
}

// Mirrors the reference's initLoaderHome(): a Hello/Bonjour/... greeting
// carousel that flashes through each word in turn before the curtain lifts
// on the very first load of the home page.
function playGreeting(): Promise<void> {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    const bh = bulgeHeight();

    tl.set(".loading-screen", { top: "0%" });
    tl.set(".loading-words", { opacity: 0 });
    tl.set(".loading-words h2.page-word", { display: "none" });
    tl.set(".loading-words h2.greeting, .loading-words h2.greeting-last", {
      display: "block",
      opacity: 0,
    });
    tl.set(".loading-words h2.greeting-first", { opacity: 1 });
    tl.set(".rounded-div-wrap.bottom", { height: bh });

    tl.to(".loading-words", { opacity: 1, duration: 0.8, ease: "power4.out", delay: 0.5 });

    tl.to(
      ".loading-words h2.greeting",
      {
        opacity: 1,
        duration: 0.01,
        stagger: 0.15,
        ease: "none",
        onStart() {
          gsap.to(".loading-words h2.greeting", {
            opacity: 0,
            duration: 0.01,
            stagger: 0.15,
            ease: "none",
            delay: 0.15,
          });
        },
      },
      "-=0.4"
    );
    tl.to(".loading-words h2.greeting-last", { opacity: 1, duration: 0.01, delay: 0.15 });

    tl.to(".loading-screen", { top: "-100%", duration: 0.8, ease: "power4.inOut", delay: 0.2 });
    tl.to(".rounded-div-wrap.bottom", { height: 0, duration: 1, ease: "power4.inOut" }, "-=0.8");
    tl.to(".loading-words", { opacity: 0, duration: 0.3, ease: "none" }, "-=0.8");

    tl.set(".loading-screen", { top: "100%" });
    tl.set(".rounded-div-wrap.bottom", { height: bh });
    tl.set(".loading-words h2.greeting, .loading-words h2.greeting-last", {
      display: "none",
      opacity: 0,
    });
    tl.set(".loading-words h2.page-word", { display: "block" });
  });
}

barba.init({
  transitions: [
    {
      name: "curtain-wipe",
      once({ next }) {
        if (next.namespace === "home") {
          playGreeting();
        } else {
          gsap.set(".loading-screen", { top: "0%" });
          revealScreen();
        }
      },
      async leave({ current }) {
        await coverScreen();
        current.container.style.display = "none";
      },
      beforeEnter({ next }) {
        setLoadingWord(next.namespace);
      },
      async enter({ next }) {
        next.container.style.display = "";
        await revealScreen();
      },
    },
  ],
});
