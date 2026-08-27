import "./index.css";
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import linkPreviewData from "./link-previews.json";

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
// level rather than per-container, so their listeners survive barba swaps; the
// clock still needs a repaint on enter because the markup itself is replaced.
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
// shows the destination's own image, title and blurb, scraped from its
// OpenGraph tags at build time by scripts/fetch-link-previews.mjs and imported
// as link-previews.json. Nothing is fetched on hover — the site is static and
// cross-origin HTML is CORS-blocked in the browser anyway — so the card paints
// instantly and works offline. Markup wins where it is opinionated:
// `data-preview-title` and `data-preview` override the scraped title and image,
// and a link the scraper could not reach (Cloudflare, a dead host) falls back
// to those plus the link's own text. Built in JS and parked on <body> rather
// than written into each page, so it survives barba swaps and there is nothing
// to re-mount on enter.

type LinkPreviewMeta = {
  ok?: boolean;
  title?: string;
  description?: string;
  siteName?: string;
  domain?: string;
  image?: string;
};

const LINK_PREVIEWS: Record<string, LinkPreviewMeta> = linkPreviewData;
type PreviewRefs = {
  win: HTMLElement;
  inner: HTMLElement;
  media: HTMLElement;
  domain: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
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
    <div class="link-preview-inner overflow-hidden border border-black/10 bg-[#ffffff] text-black">
      <div
        data-lp-media
        class="hidden aspect-[4/3] w-full border-b border-black/10 bg-[#ffffff] bg-contain bg-center bg-no-repeat"
      ></div>
      <div data-lp-meta class="flex flex-col gap-2 p-5">
        <p
          data-lp-domain
          class="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-black/40"
        ></p>
        <p data-lp-title class="link-preview-clamp font-heading text-lg font-semibold leading-snug"></p>
        <p
          data-lp-desc
          class="link-preview-clamp font-sans text-xs leading-relaxed text-black/55"
        ></p>
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
    description: win.querySelector<HTMLElement>("[data-lp-desc]")!,
    circle,
  };
}

// Keyed on the href exactly as authored, which is what the scraper walked the
// markup for; `link.href` is the absolutized form and covers the odd rewrite.
function lookupPreview(link: HTMLAnchorElement): LinkPreviewMeta {
  const raw = link.getAttribute("href") ?? "";
  const meta = LINK_PREVIEWS[raw] ?? LINK_PREVIEWS[link.href];
  return meta?.ok ? meta : {};
}

function fillPreview(refs: PreviewRefs, link: HTMLAnchorElement) {
  const meta = lookupPreview(link);

  refs.domain.textContent = meta.domain ?? link.hostname.replace(/^www\./, "");

  const label =
    link.dataset.previewTitle || meta.title || link.textContent?.trim().replace(/\s+/g, " ") || "";
  refs.title.textContent = label;
  refs.title.classList.toggle("hidden", !label);

  const blurb = meta.description ?? "";
  refs.description.textContent = blurb;
  refs.description.classList.toggle("hidden", !blurb);

  const image = link.dataset.preview ?? meta.image ?? "";
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
// Each page ships its own nav/footer markup with a `--:-- --` placeholder, so a
// barba swap drops in unpainted clocks. Repaint on enter instead of leaving them
// blank until the next 15s tick.
barba.hooks.beforeEnter(() => paintClocks());

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
//
// These are driven by an observer rather than a ScrollTrigger start position.
// A trigger asks "has the page scrolled far enough", and the last elements on a
// page answer "no" forever: their start lands at — or past — the document's
// maximum scroll, so the page can never reach it and `opacity: 0` sticks. An
// observer asks "is it on screen", which is answerable even when the element is
// already sitting in the viewport at full scroll. Wide layouts are where this
// bit; tall phone layouts scroll far enough to hide it.
const revealWatchers: IntersectionObserver[] = [];

function mountReveals(container: HTMLElement) {
  const targets = container.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!targets.length) return;

  gsap.set(targets, { y: 48, opacity: 0 });

  const watcher = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        watcher.unobserve(entry.target);
        gsap.to(entry.target, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out" });
      });
    },
    // A small absolute inset rather than a percentage: the reveal should hold
    // off until the element is properly on screen, but the tail of a page is
    // only ~100px deep, and a percentage of a tall viewport puts that line
    // somewhere the last elements can never reach.
    { rootMargin: "0px 0px -48px 0px" }
  );

  targets.forEach((el) => watcher.observe(el));
  revealWatchers.push(watcher);
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
  flipNavOn(container, section);
}

// A 36-frame turntable painted into a canvas. Only the first frame is awaited
// before the console appears; the rest stream in behind it and interaction
// unlocks once the set is complete. Dragging the full width of the canvas
// turns the object exactly once, which keeps the gearing the same on a phone
// and on a monitor.
function mountSpin360(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>("[data-spin360]");
  const canvas = root?.querySelector("canvas");
  const ctx = canvas?.getContext("2d");
  if (!root || !canvas || !ctx) return;

  const dir = root.dataset.spinDir ?? "";
  const count = Number(root.dataset.spinFrames ?? 36);
  const frames: HTMLImageElement[] = [];
  let index = 0;

  // The source frames are 16:9 with the console occupying a flat band across
  // the middle; the rest is empty studio white. Everything outside that band is
  // cropped away and the band is then fitted whole, so the console is as large
  // as the box allows and never clipped, whatever the box's aspect.
  const BAND_TOP = 0.22;
  const BAND_HEIGHT = 0.58;

  const paint = () => {
    const frame = frames[Math.round(index) % count];
    if (!frame?.complete || !frame.naturalWidth) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    const sy = frame.naturalHeight * BAND_TOP;
    const sh = frame.naturalHeight * BAND_HEIGHT;
    const sw = frame.naturalWidth;
    const scale = Math.min(canvas.width / sw, canvas.height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, sy, sw, sh, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  };

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `${dir}/SR-${1001 + i}.webp`;
      img.onload = img.onerror = () => resolve();
      frames[i] = img;
    });

  const step = () => {
    index = (index + count) % count;
    paint();
  };

  let pointer = 0;
  let startIndex = 0;
  let dragging = false;

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    pointer = event.clientX;
    startIndex = index;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    // One canvas width of travel === one full revolution.
    index = startIndex - ((event.clientX - pointer) / canvas.clientWidth) * count;
    step();
  });

  const release = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    index = Math.round(index);
    step();
    canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  // The canvas is re-measured on resize; once barba has swapped this container
  // away the handler retires itself rather than redrawing into a detached node.
  const onResize = () => {
    if (root.isConnected) paint();
    else window.removeEventListener("resize", onResize);
  };
  window.addEventListener("resize", onResize);

  // The console shows up as soon as frame 0 lands; the rest stream in behind it.
  // Dragging early is harmless — a frame that has not arrived yet simply leaves
  // the previous one on screen until it does.
  void load(0).then(() => {
    paint();
    return Promise.all(Array.from({ length: count - 1 }, (_, i) => load(i + 1))).then(() => {
      root.dataset.ready = "true";
      paint();
    });
  });
}

// Each page ships its own nav, and during a barba enter the outgoing container
// is still in the DOM — a document-wide lookup would bind the trigger to the
// nav that is about to be thrown away, so the incoming one never flips. Scope
// to the container being mounted.
function flipNavOn(container: HTMLElement, section: HTMLElement) {
  const nav = container.querySelector<HTMLElement>("[data-nav]");
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
  if (!section) return;

  flipNavOn(container, section);
}

// Triggers are measured against the container being replaced, so they have to go
// before the next one is mounted or every start/end position is stale.
function clearReveals() {
  revealWatchers.splice(0).forEach((watcher) => watcher.disconnect());
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
        mountSpin360(next.container);
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
        // Follow a link from the foot of one page and the browser keeps that
        // scroll position on the next one, dropping the reader into its middle.
        // The curtain is down here, so jumping to the top is unseen — and it has
        // to happen before the reveals and triggers below are measured.
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        setLoadingWord(next.namespace);
        armOnceIn(next.container, "transition");
        mountCover(next.container);
        mountNavFlip(next.container);
        mountSpin360(next.container);
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
