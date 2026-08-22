import "./index.css";
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bulgeHeight = () => (window.innerWidth > 540 ? "10vh" : "5vh");

const PAGE_NAMES: Record<string, string> = {
  home: "Home",
  setup: "Setup",
  content: "Content",
  gaming: "Gaming",
  projects: "Projects",
};

function setLoadingWord(namespace: string) {
  const word = document.querySelector(".loading-words h2.page-word");
  if (word) word.textContent = PAGE_NAMES[namespace] ?? "";
}

// Mirrors the reference's `.once-in` intro: everything marked with the class is
// parked half a viewport down the page, then rises into place as the curtain
// lifts — staggered in DOM order. The reference uses a shorter drop on phones,
// and a slightly longer one for page-to-page transitions than for a cold load.
const onceInOffset = (phase: "load" | "transition") =>
  window.innerWidth > 540 ? "50vh" : phase === "load" ? "10vh" : "20vh";

function onceInTargets(container: HTMLElement) {
  return container.querySelectorAll<HTMLElement>(".once-in");
}

function armOnceIn(container: HTMLElement, phase: "load" | "transition") {
  const targets = onceInTargets(container);
  if (!targets.length) return;
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
  });
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
    tl.to(
      ".loading-words h2.page-word",
      { y: -50, duration: 0.8, ease: "power4.out", delay: 0.05 },
      "<"
    );

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
// carousel that flashes through each word in turn before the curtain lifts.
// Runs on the cold load of *any* page; page-to-page transitions get
// revealScreen's page-word treatment instead.
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

// Nav: the Pune clock and the mobile drawer. Both are wired at the document
// level rather than per-container, so they keep working across barba swaps
// without needing to be re-mounted on every page enter.
const puneTime = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

function paintClocks() {
  const stamp = puneTime();
  document
    .querySelectorAll<HTMLElement>("[data-local-time]")
    .forEach((el) => (el.textContent = stamp));
}

function setMenu(open: boolean) {
  document
    .querySelectorAll<HTMLElement>("[data-menu-panel], [data-menu-backdrop]")
    .forEach((el) => (el.dataset.open = String(open)));
  document.body.style.overflow = open ? "hidden" : "";
}

// A single inverting circle trailing the pointer. `quickTo` keeps one reusable
// tween per axis instead of allocating a new one per mousemove, so the lag stays
// smooth under a firehose of pointer events.
function mountCursor() {
  const dot = document.querySelector<HTMLElement>("[data-cursor]");
  if (!dot || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  gsap.set(dot, { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3" });
  const moveY = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3" });

  let seen = false;
  window.addEventListener("pointermove", (event) => {
    if (!seen) {
      // Jump to the first known position rather than easing in from 0,0.
      seen = true;
      gsap.set(dot, { x: event.clientX, y: event.clientY });
      gsap.to(dot, { opacity: 1, duration: 0.3 });
    }
    moveX(event.clientX);
    moveY(event.clientY);
  });

  document.addEventListener("pointerleave", () => gsap.to(dot, { opacity: 0, duration: 0.3 }));
  document.addEventListener("pointerenter", () => gsap.to(dot, { opacity: 1, duration: 0.3 }));
}

// Cursor-following preview window for outbound links, after the reference's
// `.mouse-pos-list-image`. Every off-site link gets one for free: the card
// falls back to the destination's domain and the link's own text, and any link
// that has a `data-preview` image uses that instead. Built in JS and parked on
// <body> rather than written into each page, so it survives barba swaps and
// there is nothing to re-mount on enter.
type PreviewRefs = {
  win: HTMLElement;
  inner: HTMLElement;
  media: HTMLElement;
  domain: HTMLElement;
  title: HTMLElement;
  circle: HTMLElement;
};

const PREVIEW_SKIP = "[data-no-preview]";

function isOutbound(link: HTMLAnchorElement) {
  if (link.matches(PREVIEW_SKIP) || link.closest(PREVIEW_SKIP)) return false;
  if (!/^https?:$/.test(link.protocol)) return false;
  return link.host !== window.location.host;
}

function buildPreview(): PreviewRefs {
  const win = document.createElement("div");
  win.className = "link-preview";
  win.setAttribute("aria-hidden", "true");
  win.innerHTML = `
    <div class="link-preview-inner overflow-hidden bg-black text-white">
      <div
        data-lp-media
        class="hidden aspect-[4/3] w-full bg-black/40 bg-cover bg-center"
      ></div>
      <div data-lp-meta class="flex flex-col gap-2 p-5">
        <p
          data-lp-domain
          class="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-white/45"
        ></p>
        <p data-lp-title class="link-preview-title font-heading text-lg font-semibold leading-snug"></p>
        <p class="mt-1 font-sans text-xs uppercase tracking-[0.18em] text-red">Open &#8599;</p>
      </div>
    </div>`;

  const circle = document.createElement("div");
  circle.className = "link-cursor bg-red";
  circle.setAttribute("aria-hidden", "true");
  circle.innerHTML = `<span class="flex h-full w-full items-center justify-center whitespace-nowrap font-sans text-sm text-white">View</span>`;

  document.body.append(win, circle);

  return {
    win,
    inner: win.querySelector<HTMLElement>(".link-preview-inner")!,
    media: win.querySelector<HTMLElement>("[data-lp-media]")!,
    domain: win.querySelector<HTMLElement>("[data-lp-domain]")!,
    title: win.querySelector<HTMLElement>("[data-lp-title]")!,
    circle,
  };
}

function fillPreview(refs: PreviewRefs, link: HTMLAnchorElement) {
  refs.domain.textContent = link.hostname.replace(/^www\./, "");

  const label = link.dataset.previewTitle ?? link.textContent?.trim().replace(/\s+/g, " ") ?? "";
  refs.title.textContent = label;
  refs.title.classList.toggle("hidden", !label);

  const image = link.dataset.preview;
  refs.media.classList.toggle("hidden", !image);
  if (image) refs.media.style.backgroundImage = `url("${image}")`;
}

function mountLinkPreview() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const refs = buildPreview();
  const lens = document.querySelector<HTMLElement>("[data-cursor]");
  gsap.set([refs.win, refs.circle], { xPercent: -50, yPercent: -50 });

  let pointerX = 0;
  let pointerY = 0;
  let seen = false;
  const win = { x: 0, y: 0 };
  const circle = { x: 0, y: 0 };
  let active: HTMLAnchorElement | null = null;

  // Two trailing rates rather than one, so the window lags behind the circle
  // and the pair strings out along the pointer's path. Framed against 60fps and
  // scaled by deltaRatio, so the lag reads the same on a 120Hz display.
  const chase = (self: { x: number; y: number }, rate: number, delta: number) => {
    const factor = 1 - Math.pow(1 - rate, delta);
    self.x += (pointerX - self.x) * factor;
    self.y += (pointerY - self.y) * factor;
  };

  gsap.ticker.add(() => {
    if (!seen) return;
    const delta = gsap.ticker.deltaRatio(60);
    chase(win, 0.14, delta);
    chase(circle, 0.22, delta);
    gsap.set(refs.win, { x: win.x, y: win.y });
    gsap.set(refs.circle, { x: circle.x, y: circle.y });
  });

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (seen) return;
    // Start parked under the pointer instead of easing in from the corner.
    seen = true;
    win.x = circle.x = pointerX;
    win.y = circle.y = pointerY;
  });

  const open = (link: HTMLAnchorElement) => {
    const swapping = active !== null;
    active = link;
    fillPreview(refs, link);
    refs.win.classList.add("is-active");
    refs.circle.classList.add("is-active");
    if (lens) gsap.to(lens, { opacity: 0, duration: 0.25 });
    // Moving straight between two links never re-runs the width unfurl, so the
    // swap gets its own small settle to show the card actually changed.
    if (swapping)
      gsap.fromTo(refs.inner, { scale: 0.94 }, { scale: 1, duration: 0.45, ease: "power3.out" });
  };

  const close = () => {
    active = null;
    refs.win.classList.remove("is-active");
    refs.circle.classList.remove("is-active", "is-pressed");
    if (lens) gsap.to(lens, { opacity: 1, duration: 0.25 });
  };

  // Delegated, so links added by a page swap are covered without rebinding.
  document.addEventListener("pointerover", (event) => {
    const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
    if (link && isOutbound(link)) {
      if (link !== active) open(link);
    } else if (active) {
      close();
    }
  });

  document.addEventListener("pointerdown", () => {
    if (active) refs.circle.classList.add("is-pressed");
  });
  document.addEventListener("pointerup", () => refs.circle.classList.remove("is-pressed"));
  window.addEventListener("blur", close);
  barba.hooks.beforeLeave(() => close());
}

mountCursor();
mountLinkPreview();
paintClocks();
setInterval(paintClocks, 15_000);

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-menu-toggle]")) setMenu(true);
  else if (target?.closest("[data-menu-close]")) setMenu(false);
  else if (target?.closest("[data-menu-backdrop]")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

// A drawer left open while the viewport grows past `md` would strand the scroll
// lock, since the panel itself is hidden at that width.
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) setMenu(false);
});

// Triggers are measured on the cold load, before webfonts have swapped in and
// before the hero image has decoded — both of which resize the page underneath
// them. Re-measuring once each has settled keeps the start positions honest.
function settleTriggers() {
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });
  document.fonts?.ready.then(refresh);
}

// Scroll reveals for anything below the hero. The hero's own intro runs off the
// curtain timeline (`.once-in`), so these are kept on a separate hook.
function mountReveals(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 48,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
      // `clamp()` pins the start inside the scrollable range. Without it the
      // last elements on a short page ask to be triggered at a scroll position
      // past the document's maximum — the page can never scroll that far, the
      // trigger never fires, and `from`'s opacity:0 leaves them invisible for
      // good. Tall phone layouts hide the bug; wide desktop ones expose it.
      scrollTrigger: { trigger: el, start: "clamp(top 88%)", once: true },
    });
  });
}

// The cover panel: its diagonal leading edge (`--cut`) closes to flat over the
// travel, so the cross-cut is only ever visible mid-scroll, and its contents
// drift up slightly slower than the page for a little parallax.
function mountCover(container: HTMLElement) {
  const section = container.querySelector<HTMLElement>("[data-cover]");
  if (!section) return;

  const travel = { trigger: section, start: "top bottom", end: "top top", scrub: 0.6 } as const;

  gsap.to(section, { "--cut": "0vw", ease: "none", scrollTrigger: travel });

  const inner = section.querySelector<HTMLElement>("[data-cover-inner]");
  if (inner) gsap.from(inner, { y: 90, ease: "none", scrollTrigger: travel });

  // White panel under a white nav is unreadable, so the nav flips to black the
  // moment the panel's edge reaches it — and back on the way up.
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;

  ScrollTrigger.create({
    trigger: section,
    start: () => `top ${nav.offsetHeight}px`,
    onEnter: () => (nav.dataset.onLight = "true"),
    onLeaveBack: () => (nav.dataset.onLight = "false"),
  });
}

// The home page flips the nav to its on-light colours off the cover panel.
// Pages that open on a dark hero and then run light need the same flip without
// a cover, so any element marked `data-nav-flip` can drive it.
function mountNavFlip(container: HTMLElement) {
  const section = container.querySelector<HTMLElement>("[data-nav-flip]");
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!section || !nav) return;

  ScrollTrigger.create({
    trigger: section,
    start: () => `top ${nav.offsetHeight}px`,
    onEnter: () => (nav.dataset.onLight = "true"),
    onLeaveBack: () => (nav.dataset.onLight = "false"),
  });
}

// Triggers are measured against the container being replaced, so they have to go
// before the next one is mounted or every start/end position is stale.
function clearReveals() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

barba.init({
  transitions: [
    {
      name: "curtain-wipe",
      once({ next }) {
        // Cover the page and park the `.once-in` elements in the same tick, so
        // the drop is never visible: the curtain is already over it.
        gsap.set(".loading-screen", { top: "0%" });
        armOnceIn(next.container, "load");
        mountCover(next.container);
        mountNavFlip(next.container);
        mountReveals(next.container);
        settleTriggers();
        playGreeting(next.container);
      },
      async leave({ current }) {
        clearReveals();
        await coverScreen();
        current.container.style.display = "none";
      },
      beforeEnter({ next }) {
        setLoadingWord(next.namespace);
        armOnceIn(next.container, "transition");
        mountCover(next.container);
        mountNavFlip(next.container);
        mountReveals(next.container);
      },
      async enter({ next }) {
        next.container.style.display = "";
        ScrollTrigger.refresh();
        await revealScreen(next.container);
      },
    },
  ],
});
