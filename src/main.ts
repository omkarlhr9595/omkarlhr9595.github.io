import "./index.css";
import "locomotive-scroll/dist/locomotive-scroll.css";
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import { NAV_ROUTES, initNav, updateNavScrolled } from "./nav";

gsap.registerPlugin(ScrollTrigger);

const bulgeHeight = () => (window.innerWidth > 540 ? "10vh" : "5vh");

let scroll: LocomotiveScroll | null = null;
let currentScrollY = 0;
let introRunning = false;

// Mirrors the reference's `.once-in` intro: everything marked with the class is
// parked half a viewport down the page, then rises into place as the curtain
// lifts — staggered in DOM order, so on the home page the photo leads and the
// name follows. The reference uses a shorter drop on phones, and a slightly
// longer one for page-to-page transitions than for a cold load.
const onceInOffset = (phase: "load" | "transition") =>
  window.innerWidth > 540 ? "50vh" : phase === "load" ? "10vh" : "20vh";

function onceInTargets(container: HTMLElement) {
  return container.querySelectorAll<HTMLElement>(".once-in");
}

// Arming has to happen *after* Locomotive is constructed: it measures every
// section and parallax target once from their bounding rects, and a target
// that is 50vh off its resting place at that moment gets the wrong offsets.
// For the same reason scroll is frozen until the rise lands, and only then is
// a re-measure allowed through.
function armOnceIn(container: HTMLElement, phase: "load" | "transition") {
  const targets = onceInTargets(container);
  if (!targets.length) return;
  introRunning = true;
  scroll?.stop();
  gsap.set(targets, { y: onceInOffset(phase) });
}

function onceInTween(container: HTMLElement, duration: number, stagger: number) {
  const targets = onceInTargets(container);
  if (!targets.length) return null;

  return gsap.to(targets, {
    y: "0vh",
    duration,
    stagger,
    ease: "expo.out",
    clearProps: true,
    onComplete() {
      introRunning = false;
      // The menu can be opened mid-intro (its Menu trigger is always live on
      // phones), and it owns the scroll lock while open — don't hand scrolling
      // back underneath it.
      if (!container.classList.contains("nav-active")) scroll?.start();
      scroll?.update();
    },
  });
}

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
    updateNavScrolled(container, currentScrollY);
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

  // Locomotive measures every section's offset/limit once, then hides any
  // section it reads as out of view. Anything that changes layout height after
  // init — a late image, a webfont swap — leaves those offsets stale and can
  // blank out a section that is actually on screen. Re-measure when it happens.
  const remeasure = () => {
    if (!introRunning) scroll?.update();
  };
  document.fonts.ready.then(remeasure);
  window.addEventListener("load", remeasure);
  el.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", remeasure, { once: true });
  });
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

// Lets each ".mat-doodle" sticker be dragged anywhere within its layer, and
// rotated with a two-finger twist. Pointer events (not mouse/touch) so one
// listener covers both input types, and stopPropagation keeps gestures from
// being swallowed by locomotive-scroll's own touch handling on the
// smooth-scroll container.
function initMatDoodles(container: HTMLElement) {
  const doodles = container.querySelectorAll<HTMLElement>(".mat-doodle");

  doodles.forEach((doodle) => {
    const layer = doodle.parentElement;
    if (!layer) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let rotation = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let rotateStartAngle = 0;
    let rotateBaseRotation = 0;

    const angleBetween = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

    // offsetLeft/offsetTop are the element's unrotated layout position, so the
    // drag math stays correct no matter how the sticker is currently rotated
    // (its getBoundingClientRect would otherwise be a skewed bounding box).
    const beginDrag = (point: { x: number; y: number }) => {
      const layerRect = layer.getBoundingClientRect();
      dragOffsetX = point.x - layerRect.left - doodle.offsetLeft;
      dragOffsetY = point.y - layerRect.top - doodle.offsetTop;
    };

    const beginRotate = () => {
      const [a, b] = [...pointers.values()];
      rotateStartAngle = angleBetween(a, b);
      rotateBaseRotation = rotation;
    };

    doodle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      doodle.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        beginDrag({ x: event.clientX, y: event.clientY });
      } else if (pointers.size === 2) {
        beginRotate();
      }
    });

    doodle.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        rotation = rotateBaseRotation + (angleBetween(a, b) - rotateStartAngle);
        doodle.style.transform = `rotate(${rotation}deg)`;
        return;
      }

      if (pointers.size === 1) {
        const layerRect = layer.getBoundingClientRect();
        const maxLeft = layerRect.width - doodle.offsetWidth;
        const maxTop = layerRect.height - doodle.offsetHeight;
        const left = event.clientX - layerRect.left - dragOffsetX;
        const top = event.clientY - layerRect.top - dragOffsetY;

        doodle.style.left = `${Math.min(Math.max(left, 0), Math.max(maxLeft, 0))}px`;
        doodle.style.top = `${Math.min(Math.max(top, 0), Math.max(maxTop, 0))}px`;
      }
    });

    const endPointer = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      doodle.releasePointerCapture(event.pointerId);

      if (pointers.size === 2) {
        beginRotate();
      } else if (pointers.size === 1) {
        const [remaining] = [...pointers.values()];
        beginDrag(remaining);
      }
    };

    doodle.addEventListener("pointerup", endPointer);
    doodle.addEventListener("pointercancel", endPointer);

    // Corner handle: mouse/trackpad rotate, since neither has a pinch gesture.
    // Shares the same `rotation` state as the two-finger path above, so
    // switching between touch-twist and handle-drag stays continuous.
    const handle = doodle.querySelector<HTMLElement>(".mat-doodle-rotate");
    if (!handle) return;

    let handleStartAngle = 0;
    let handleBaseRotation = 0;

    const angleFromCenter = (point: { x: number; y: number }) => {
      const layerRect = layer.getBoundingClientRect();
      const center = {
        x: layerRect.left + doodle.offsetLeft + doodle.offsetWidth / 2,
        y: layerRect.top + doodle.offsetTop + doodle.offsetHeight / 2,
      };
      return angleBetween(center, point);
    };

    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      handleStartAngle = angleFromCenter({ x: event.clientX, y: event.clientY });
      handleBaseRotation = rotation;
    });

    handle.addEventListener("pointermove", (event) => {
      if (!handle.hasPointerCapture(event.pointerId)) return;
      const angle = angleFromCenter({ x: event.clientX, y: event.clientY });
      rotation = handleBaseRotation + (angle - handleStartAngle);
      doodle.style.transform = `rotate(${rotation}deg)`;
    });

    const endHandleRotate = (event: PointerEvent) => {
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    };
    handle.addEventListener("pointerup", endHandleRotate);
    handle.addEventListener("pointercancel", endHandleRotate);
  });
}

// The ransom-note letter set at /assets/ransom_notes_Letters has 3 cutout
// variants per letter, A through Z, laid out as consecutive file numbers:
// A -> 1,2,3, B -> 4,5,6, ... Z -> 76,77,78.
function ransomVariantsFor(letter: string): number[] {
  const index = letter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  return [index * 3 + 1, index * 3 + 2, index * 3 + 3];
}

// Picks a random cutout variant per letter, so "[data-letter]" images never
// render the same combination twice in a row. Each also gets a small random
// tilt for the cut-and-pasted ransom-note look.
function shuffleRansomLetters(container: ParentNode) {
  const letters = container.querySelectorAll<HTMLImageElement>(".ransom-letter[data-letter]");

  letters.forEach((img) => {
    const letter = img.dataset.letter;
    if (!letter) return;

    const variants = ransomVariantsFor(letter);
    const variant = variants[Math.floor(Math.random() * variants.length)];
    img.src = `/assets/ransom_notes_Letters/${variant}.png`;

    const tilt = Math.random() * 16 - 8;
    img.style.transform = `rotate(${tilt.toFixed(1)}deg)`;
  });
}

function initRansomTitles(container: HTMLElement) {
  shuffleRansomLetters(container);

  const shuffleButton = container.querySelector<HTMLButtonElement>("[data-ransom-shuffle]");
  shuffleButton?.addEventListener("click", () => shuffleRansomLetters(container));
}

const PAGE_NAMES: Record<string, string> = Object.fromEntries(
  NAV_ROUTES.map((route) => [route.namespace, route.label])
);

// The nav lives inside the Barba container, so it is re-rendered per page —
// which is also how the active-route dot and the theme stay correct. Opening it
// has to freeze Locomotive, otherwise the page keeps scrolling behind the panel.
function setupNav(container: HTMLElement, namespace: string) {
  initNav(container, namespace, {
    onOpen: () => scroll?.stop(),
    onClose: () => scroll?.start(),
  });
}

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
function revealScreen(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    const bh = bulgeHeight();

    tl.set(".rounded-div-wrap.bottom", { height: bh });

    tl.to(".loading-words", { opacity: 1, duration: 0.8, ease: "power4.out", delay: 0.05 });
    tl.to(".loading-words h2.page-word", { y: -50, duration: 0.8, ease: "power4.out", delay: 0.05 }, "<");

    // Labelled so the `.once-in` rise below can be pinned to the exact moment
    // the curtain starts sliding away, without depending on where the resets
    // that follow it happen to land.
    tl.addLabel("lift", "-=0.2");
    tl.to(".loading-screen", { top: "-100%", duration: 0.8, ease: "power3.inOut" }, "lift");
    tl.to(".loading-words", { opacity: 0, duration: 0.6, ease: "none" }, "-=0.8");
    tl.to(".rounded-div-wrap.bottom", { height: 0, duration: 0.85, ease: "power3.inOut" }, "-=0.6");

    tl.set(".loading-screen", { top: "100%" });
    tl.set(".rounded-div-wrap.bottom", { height: bh });
    tl.set(".loading-words", { opacity: 0 });
    tl.set(".loading-words h2.page-word", { y: 0 });

    const rise = onceInTween(container, 1, 0.05);
    if (rise) tl.add(rise, "lift");
  });
}

// Mirrors the reference's initLoaderHome(): a Hello/Bonjour/... greeting
// carousel that flashes through each word in turn before the curtain lifts
// on the very first load of the home page.
function playGreeting(container: HTMLElement): Promise<void> {
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

    // The greeting carousel's length isn't known up front, so the curtain lift
    // gets a label the `.once-in` rise can hang off (past the tween's own 0.2s
    // lead-in) instead of a computed delay.
    tl.addLabel("lift");
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

    // Longer and more spread out than a page transition — the reference gives
    // the cold load 1.5s and a 0.07s stagger.
    const rise = onceInTween(container, 1.5, 0.07);
    if (rise) tl.add(rise, "lift+=0.2");
  });
}

barba.init({
  transitions: [
    {
      name: "curtain-wipe",
      once({ next }) {
        setupNav(next.container, next.namespace);
        initSmoothScroll(next.container);
        // Cover the page and park the `.once-in` elements in the same tick, so
        // the drop is never visible: the curtain is already over it, and the
        // clone initScrollLetters makes below inherits the parked position.
        gsap.set(".loading-screen", { top: "0%" });
        armOnceIn(next.container, "load");
        initScrollLetters(next.container);
        initCreditSwap(next.container);
        initMatDoodles(next.container);
        initRansomTitles(next.container);
        if (next.namespace === "home") {
          playGreeting(next.container);
        } else {
          revealScreen(next.container);
        }
      },
      async leave({ current }) {
        destroySmoothScroll();
        await coverScreen();
        current.container.style.display = "none";
      },
      beforeEnter({ next }) {
        setLoadingWord(next.namespace);
        setupNav(next.container, next.namespace);
        initSmoothScroll(next.container);
        armOnceIn(next.container, "transition");
        initScrollLetters(next.container);
        initCreditSwap(next.container);
        initMatDoodles(next.container);
        initRansomTitles(next.container);
      },
      async enter({ next }) {
        next.container.style.display = "";
        await revealScreen(next.container);
      },
    },
  ],
});
