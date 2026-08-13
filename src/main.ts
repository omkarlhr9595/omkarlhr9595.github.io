import "./index.css";
import "locomotive-scroll/dist/locomotive-scroll.css";
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";

gsap.registerPlugin(ScrollTrigger);

const bulgeHeight = () => (window.innerWidth > 540 ? "10vh" : "5vh");

let scroll: LocomotiveScroll | null = null;
let currentScrollY = 0;

// Mirrors the reference's "Code by Dennis" → "Snellenberg" credit swap: the
// slide distance has to equal the rendered width of "Setup by " exactly, or
// "Omkar" lands short/long of where "Setup by" used to start.
function initCreditSwap(container: HTMLElement) {
  const link = container.querySelector<HTMLElement>(".credit-swap");
  const setupBy = link?.querySelector<HTMLElement>(".credit-setup-by");
  if (!link || !setupBy) return;

  const measure = () => {
    link.style.setProperty("--credit-slide", `-${setupBy.offsetWidth}px`);
  };
  measure();
  document.fonts.ready.then(measure);
  window.addEventListener("resize", measure);
}

function initSmoothScroll(container: HTMLElement) {
  const el = container.querySelector<HTMLElement>("[data-scroll-container]");
  if (!el) return;

  scroll = new LocomotiveScroll({ el, smooth: true });
  currentScrollY = 0;

  scroll.on("scroll", (event) => {
    currentScrollY = event.scroll.y;
    ScrollTrigger.update();
  });

  ScrollTrigger.scrollerProxy(el, {
    scrollTop(value?: number) {
      if (value !== undefined) {
        scroll?.scrollTo(value, { duration: 0, disableLerp: true });
        return;
      }
      return currentScrollY;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: el.style.transform ? "transform" : "fixed",
  });

  ScrollTrigger.defaults({ scroller: el });
  ScrollTrigger.addEventListener("refresh", () => scroll?.update());
  ScrollTrigger.refresh();
}

function destroySmoothScroll() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  scroll?.destroy();
  scroll = null;
}

// Mirrors the reference's initScrollLetters(): clones ".big-name .name-wrap",
// places the clone right next to the original, then loops both across the
// screen forever, reversing direction to match the scroll direction.
function initScrollLetters(container: HTMLElement) {
  const nameWrap = container.querySelector<HTMLElement>(".big-name .name-wrap");
  const scrollContainer = container.querySelector<HTMLElement>("[data-scroll-container]");
  if (!nameWrap || !scrollContainer) return;

  const clone = nameWrap.cloneNode(true) as HTMLElement;
  nameWrap.parentNode?.appendChild(clone);

  const positionClone = () => {
    gsap.set(clone, {
      position: "absolute",
      top: nameWrap.offsetTop,
      left: nameWrap.offsetLeft + nameWrap.offsetWidth,
    });
  };
  positionClone();

  // The name is set in a webfont that loads async — re-measure once it's
  // ready, since the fallback-font width used above is usually narrower and
  // leaves the clone overlapping the original instead of sitting flush after it.
  document.fonts.ready.then(positionClone);

  const rollTl = gsap.timeline({
    repeat: -1,
    onReverseComplete() {
      this.totalTime(this.rawTime() + this.duration() * 10);
    },
  });
  rollTl.to([nameWrap, clone], { xPercent: -100, duration: 18, ease: "none" }, 0);

  window.addEventListener("resize", () => {
    const time = rollTl.totalTime();
    rollTl.totalTime(0);
    positionClone();
    rollTl.totalTime(time);
  });

  let direction = 1;
  ScrollTrigger.create({
    trigger: scrollContainer,
    onUpdate(self) {
      if (self.direction !== direction) {
        direction *= -1;
        gsap.to(rollTl, { timeScale: direction, overwrite: true });
      }
    },
  });
}

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
        initSmoothScroll(next.container);
        initScrollLetters(next.container);
        initCreditSwap(next.container);
        if (next.namespace === "home") {
          playGreeting();
        } else {
          gsap.set(".loading-screen", { top: "0%" });
          revealScreen();
        }
      },
      async leave({ current }) {
        destroySmoothScroll();
        await coverScreen();
        current.container.style.display = "none";
      },
      beforeEnter({ next }) {
        setLoadingWord(next.namespace);
        initSmoothScroll(next.container);
        initScrollLetters(next.container);
        initCreditSwap(next.container);
      },
      async enter({ next }) {
        next.container.style.display = "";
        await revealScreen();
      },
    },
  ],
});
