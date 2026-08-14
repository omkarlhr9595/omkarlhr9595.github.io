import { gsap } from "gsap";

// Port of the reference site's navigation (ref/index.html + styleguide.css +
// style-new.css + index-new.js) to Tailwind utility classes. The markup lives
// here rather than in each page's HTML so the five routes can't drift apart —
// every page just drops in `[data-nav-bar]` and `[data-nav-overlay]` hooks.
//
// State lives as classes on the Barba container (the reference used `main`):
//   .nav-active → sidebar in, backdrop visible, bulge collapsed
//   .scrolled   → floating hamburger pops in
// The `[.nav-active_&]` / `[.scrolled_&]` arbitrary variants below read them.
//
// Every class below is written out literally: Tailwind scans this file as
// plain text, so a class assembled by template interpolation would never be
// generated. Interpolating a whole pre-written class list is fine — building a
// new class name out of fragments is not.

type NavTheme = "dark" | "light";

export type NavRoute = { label: string; href: string; namespace: string };

// "Home" is sidebar-only — in the reference the © credit link on the left of
// the top bar is already the home link.
export const NAV_ROUTES: NavRoute[] = [
  { label: "Home", href: "/", namespace: "home" },
  { label: "Setup", href: "/setup/", namespace: "setup" },
  { label: "Content", href: "/content/", namespace: "content" },
  { label: "Gaming", href: "/gaming/", namespace: "gaming" },
  { label: "Projects", href: "/projects/", namespace: "projects" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/omkarlhr9595" },
  { label: "Instagram", href: "https://www.instagram.com/omkarlhr9595/" },
  { label: "Twitter", href: "https://twitter.com/omkarlhr9595" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/omkarlhr9595/" },
];

// --- Shared class fragments ----------------------------------------------

// The reference is sized entirely in `em` off a fluid root, so every nav root
// re-establishes that root plus the two spacing vars its math depends on.
const TOKENS = [
  "text-[clamp(16px,1.2vw,19px)]",
  "[--gap-padding:clamp(1.5em,4vw,2.5em)]",
  "[--container-padding:clamp(2.5em,8vw,8em)]",
  "max-[1200px]:[--container-padding:6vw]",
  "max-[540px]:[--container-padding:clamp(1.25em,4vw,2.5em)]",
].join(" ");

// `.btn-click` — the hit area every magnetic button shares.
const BTN_CLICK = [
  "btn-click magnetic",
  "relative flex cursor-pointer items-center justify-center",
  "border-0 bg-transparent p-0 text-[1em] no-underline outline-none",
  "h-[2.75em] min-w-[1em] overflow-visible rounded-none",
  "[transform:translateZ(0)_rotate(0.001deg)] [will-change:transform]",
].join(" ");

// `.btn-text` — sits above `.btn-fill`, and is what the magnet nudges by half
// the strength of its parent so the label trails behind the button.
const BTN_TEXT = [
  "btn-text pointer-events-none relative z-[2]",
  "flex h-full w-full items-center justify-center",
  "px-[calc(var(--gap-padding)/2)]",
  "[transform:rotate(0.001deg)] [will-change:transform,color]",
].join(" ");

// The `::after` dot under a top-bar link. Four states, exactly as the
// reference: hidden by default, shown for `.active`, shown on hover, and —
// while any sibling in the `group/links` list is hovered — hidden again for
// `.active`, so only the hovered link keeps a dot. The `!` on the hover rule
// is what lets a hovered *active* link win over that dimming rule.
const DOT_SHARED = [
  "after:absolute after:block after:content-[''] after:rounded-full",
  "after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0",
  "after:transition-all after:duration-300",
  "after:[transition-timing-function:cubic-bezier(.7,0,.3,1)]",
  "hover:after:!scale-100",
  "[.active>&]:after:scale-100",
  "group-hover/links:[.active>&]:after:scale-0",
].join(" ");

const DOT_BAR_GEOMETRY = [
  "after:bottom-[-0.5em]",
  "after:h-[calc(clamp(16px,1.2vw,19px)/2.75)]",
  "after:w-[calc(clamp(16px,1.2vw,19px)/2.75)]",
].join(" ");

const DOT_BAR_DARK = `${DOT_SHARED} ${DOT_BAR_GEOMETRY} after:bg-[#FFFFFF] after:shadow-[0_1px_6px_rgba(0,0,0,0.45)]`;
const DOT_BAR_LIGHT = `${DOT_SHARED} ${DOT_BAR_GEOMETRY} after:bg-[#1C1D20] after:shadow-[0_1px_5px_rgba(0,0,0,0.2)]`;

// The top bar floats over the hero photo, so its labels get the same kind of
// lift the big name has — just far softer, since these are small text. Sidebar
// links sit on flat dark and need none.
const BAR_TEXT_SHADOW_DARK = "[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]";
const BAR_TEXT_SHADOW_LIGHT = "[text-shadow:0_1px_6px_rgba(0,0,0,0.15)]";

// Sidebar links get a bigger dot, pulled out into the left margin and centred
// vertically instead of underhung. On phones it flips to the right edge.
const DOT_SIDEBAR = [
  DOT_SHARED,
  "after:!left-[calc(var(--gap-padding)/-4)] after:top-1/2 after:bottom-auto",
  "after:h-[calc(clamp(16px,1.2vw,19px)/1.65)]",
  "after:w-[calc(clamp(16px,1.2vw,19px)/1.65)]",
  "after:bg-[#FFFFFF]",
  "max-[540px]:after:!left-auto max-[540px]:after:right-[.4em]",
  "max-[540px]:after:h-[calc(clamp(16px,1.2vw,19px)/1.5)]",
  "max-[540px]:after:w-[calc(clamp(16px,1.2vw,19px)/1.5)]",
].join(" ");

// `.btn-link-external` — an underline that wipes open from the centre.
const UNDERLINE_EXTERNAL = [
  "after:absolute after:block after:content-['']",
  "after:left-1/2 after:bottom-0 after:h-px after:w-full after:rounded-none",
  "after:bg-[#FFFFFF]",
  "after:-translate-x-1/2 after:-translate-y-1/2 after:scale-x-0 after:scale-y-100",
  "after:transition-all after:duration-300",
  "after:[transition-timing-function:cubic-bezier(.7,0,.3,1)]",
  "hover:after:scale-x-100",
].join(" ");

// Sidebar rows fan out: each sits 15vw right of home until `.nav-active`, and
// its own transition-delay is what staggers the arrival.
const SIDEBAR_ROW_DELAYS = [
  "delay-[0ms] [.nav-active_&]:delay-[100ms]",
  "delay-[30ms] [.nav-active_&]:delay-[130ms]",
  "delay-[60ms] [.nav-active_&]:delay-[160ms]",
  "delay-[90ms] [.nav-active_&]:delay-[190ms]",
  "delay-[120ms] [.nav-active_&]:delay-[220ms]",
];

const H5 = "text-[.6em] uppercase leading-[1.065] tracking-[.05em] opacity-50 text-white";

const STRIPE_LIGHT = "block h-px w-full bg-[rgba(255,255,255,0.2)]";

const barText = (theme: NavTheme) =>
  theme === "dark"
    ? `text-white ${BAR_TEXT_SHADOW_DARK}`
    : `text-[#1C1D20] ${BAR_TEXT_SHADOW_LIGHT}`;

// --- Markup --------------------------------------------------------------

// The © credit link. Hovering rotates the ©, slides "Setup by" out of an
// overflow-hidden window and pulls "Lohar" in behind "Omkar". The slide
// distance is measured at runtime by initCreditSwap() in main.ts, because it
// has to equal the rendered width of "Setup by " to the pixel.
function creditMarkup(theme: NavTheme) {
  const text = barText(theme);
  return `
    <div class="credits-top">
      <div class="btn btn-link btn-left-top relative z-[5] m-0">
        <a
          href="/"
          data-strength="20"
          data-strength-text="10"
          class="${BTN_CLICK} credit-swap group/credit ${text} font-medium"
        >
          <span class="${BTN_TEXT} !px-0 ${text}">
            <span class="credit inline-block pr-[.21em]">
              <span
                class="relative inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.3,1)] group-hover/credit:rotate-[360deg]"
                >&copy;</span
              >
            </span>
            <span class="cbd relative overflow-hidden whitespace-nowrap">
              <span
                class="relative inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.3,1)] group-hover/credit:[transform:translateX(var(--credit-slide,-6em))]"
              >
                <span class="credit-setup-by code-by inline-block">Setup by&nbsp;</span>
                <span class="dennis relative inline-block"
                  >Omkar<span class="snellenberg absolute left-full top-0 whitespace-nowrap pl-[0.3em]"
                    >Lohar</span
                  ></span
                >
              </span>
            </span>
          </span>
        </a>
      </div>
    </div>`;
}

function navBarLink(route: NavRoute, namespace: string, theme: NavTheme) {
  const dot = theme === "dark" ? DOT_BAR_DARK : DOT_BAR_LIGHT;
  const text = barText(theme);
  const active = route.namespace === namespace ? " active" : "";
  return `
    <li class="btn btn-link relative z-[5] m-0 hover:z-[15] max-[540px]:hidden${active}">
      <a href="${route.href}" data-strength="20" data-strength-text="10" class="${BTN_CLICK} ${dot}">
        <span class="${BTN_TEXT} ${text}">
          <span class="btn-text-inner">${route.label}</span>
        </span>
      </a>
    </li>`;
}

// The top bar. Absolute (not fixed) so it parallaxes away with the hero, and
// on phones every route collapses into the single "Menu" trigger — whose dot
// sits permanently to the left of the label instead of underneath it.
function navBarMarkup(namespace: string, theme: NavTheme) {
  const text = barText(theme);
  const menuDot =
    theme === "dark"
      ? "after:bg-[#FFFFFF] after:shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
      : "after:bg-[#1C1D20] after:shadow-[0_1px_5px_rgba(0,0,0,0.2)]";
  const links = NAV_ROUTES.filter((route) => route.namespace !== "home")
    .map((route) => navBarLink(route, namespace, theme))
    .join("");

  return `
    <div
      class="nav-bar absolute left-0 top-0 z-[5] flex w-full items-center justify-between bg-transparent p-[calc(var(--gap-padding)/2)] [transform:translate(0,0)_rotate(0.001deg)] max-[540px]:py-[var(--gap-padding)] max-[540px]:pl-[calc(var(--gap-padding)*.33)] max-[540px]:pr-[calc(var(--gap-padding)*.5)] ${TOKENS}"
    >
      ${creditMarkup(theme)}
      <ul class="links-wrap group/links flex list-none p-0">
        ${links}
        <li class="btn btn-link btn-menu relative z-[5] m-0 hidden max-[540px]:block">
          <div
            data-strength="20"
            data-strength-text="10"
            class="${BTN_CLICK} after:absolute after:block after:content-[''] after:rounded-full after:left-0 after:bottom-1/2 after:h-[calc(clamp(16px,1.2vw,19px)/2.75)] after:w-[calc(clamp(16px,1.2vw,19px)/2.75)] ${menuDot} after:[transform:translate(-50%,50%)_scale(1)_rotate(0.001deg)]"
          >
            <div class="${BTN_TEXT} ${text}">
              <span class="btn-text-inner">Menu</span>
            </div>
          </div>
        </li>
      </ul>
    </div>`;
}

// Floating hamburger. Scaled to 0 until `.scrolled` lands — then it springs in
// on a back-out ease — and forced visible whenever the sidebar is open. The
// two bars are `::before`/`::after` on one element so they can meet in the
// middle and cross into an X.
function hamburgerMarkup() {
  return `
    <div
      class="btn btn-hamburger group/ham fixed right-[calc(var(--gap-padding)/1.5)] top-[calc(var(--gap-padding)/1.5)] z-[105] m-0 scale-0 transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.36,0,0.66,0)] [.scrolled_&]:scale-100 [.scrolled_&]:[transition-timing-function:cubic-bezier(0.34,1.5,0.64,1)] [&.active]:scale-100 ${TOKENS}"
    >
      <div
        data-strength="50"
        data-strength-text="25"
        class="btn-click magnetic relative flex h-[clamp(4em,5.5vw,5em)] w-[clamp(4em,5.5vw,5em)] cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 p-0 bg-[#1C1D20] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] transition-[background-color,box-shadow] duration-[250ms] [transition-timing-function:cubic-bezier(0.36,0,0.66,0)] [transform:translateZ(0)_rotate(0.001deg)] [will-change:transform] group-[.active]/ham:bg-[#455CE9] [.nav-active_&]:!shadow-[inset_0_0_0_1px_transparent]"
      >
        <div
          class="btn-fill absolute left-[-25%] top-[-50%] h-[200%] w-[150%] rounded-[50%] bg-[#455CE9] [transform:translate3d(0,-76%,0)] [will-change:transform] transition-colors duration-[250ms] ease-in-out"
        ></div>
        <div
          class="btn-text pointer-events-none relative z-[2] flex h-[clamp(4em,5.5vw,5em)] w-[clamp(4em,5.5vw,5em)] items-center justify-center rounded-full [will-change:transform]"
        >
          <div
            class="btn-bars absolute h-[8%] w-[28%] opacity-100 before:absolute before:left-1/2 before:top-0 before:block before:h-px before:w-full before:bg-white before:content-[''] before:[transform:translate(-50%,-50%)] before:transition-all before:duration-300 before:[transition-timing-function:cubic-bezier(.7,0,.3,1)] after:absolute after:left-1/2 after:top-full after:block after:h-px after:w-full after:bg-white after:content-[''] after:[transform:translate(-50%,-50%)] after:transition-all after:duration-300 after:[transition-timing-function:cubic-bezier(.7,0,.3,1)] group-[.active]/ham:before:top-1/2 group-[.active]/ham:before:[transform:translate(-50%,-50%)_rotate(-45deg)] group-[.active]/ham:after:top-1/2 group-[.active]/ham:after:[transform:translate(-50%,-50%)_rotate(45deg)]"
          ></div>
          <span class="btn-text-inner text-white opacity-0">Menu</span>
        </div>
      </div>
    </div>`;
}

function sidebarLink(route: NavRoute, namespace: string, index: number) {
  const active = route.namespace === namespace ? " active" : "";
  const delays = SIDEBAR_ROW_DELAYS[index] ?? SIDEBAR_ROW_DELAYS[SIDEBAR_ROW_DELAYS.length - 1];
  return `
    <li
      class="btn btn-link relative z-[5] m-0 hover:z-[15] [transform:translate(15vw,0)_rotate(0.001deg)] transition-all duration-[800ms] [transition-timing-function:cubic-bezier(.7,0,.2,1)] [will-change:transform] [.nav-active_&]:[transform:translate(0,0)_rotate(0.001deg)] ${delays} max-[540px]:w-full${active}"
    >
      <a href="${route.href}" data-strength="24" data-strength-text="12" class="${BTN_CLICK} !h-auto ${DOT_SIDEBAR}">
        <span class="${BTN_TEXT} text-white max-[540px]:justify-start">
          <span
            class="btn-text-inner text-[calc(clamp(3.25em,5vw,4em)*.875)] leading-[1.4] [@media(max-height:680px)]:text-[3em] [@media(max-height:680px)]:leading-[1.25]"
            >${route.label}</span
          >
        </span>
      </a>
    </li>`;
}

function socialsMarkup() {
  const items = SOCIAL_LINKS.map(
    (social) => `
      <li class="btn btn-link btn-link-external relative z-[5] m-0 inline-flex text-[.85em] hover:z-[15] max-[540px]:text-[1em]">
        <a
          href="${social.href}"
          target="_blank"
          rel="noopener noreferrer"
          data-strength="20"
          data-strength-text="10"
          class="${BTN_CLICK} !h-[2.25em] mx-[calc(var(--gap-padding)/3)] ${UNDERLINE_EXTERNAL}"
        >
          <span class="${BTN_TEXT} !px-0 text-white">
            <span class="btn-text-inner">${social.label}</span>
          </span>
        </a>
      </li>`
  ).join("");

  return `
    <div class="row social-row relative flex flex-wrap ml-[calc(var(--gap-padding)/-4)]">
      <div class="stripe hidden h-px w-full bg-[rgba(255,255,255,0.2)] max-[540px]:block max-[540px]:mb-[4vh]"></div>
      <div class="socials w-full">
        <h5 class="${H5} mb-[1em] pl-[calc(var(--gap-padding)*.5)]">Socials</h5>
        <ul class="flex w-full flex-wrap list-none p-0">${items}</ul>
      </div>
    </div>`;
}

// The slide-in sidebar. The `.fixed-nav-rounded-div` to its left is a huge
// circle inside an overflow-hidden 6vw column: as the panel arrives the column
// collapses to 0, so its leading edge reads as a rubbery bulge being pulled
// flat rather than a straight edge sliding in.
//
// The ellipse's `left: 50%` plus `translateX(-6.5%)` of its own 775% width is
// what lands its extreme left tip on the column's left edge — that tip is the
// only part curved enough to read as a bulge, so dropping either half of that
// pair slides the window onto a nearly straight stretch of the curve instead.
function sidebarMarkup(namespace: string) {
  const links = NAV_ROUTES.map((route, index) => sidebarLink(route, namespace, index)).join("");

  return `
    <div
      class="fixed-nav-back fixed inset-0 z-[100] h-full w-full bg-[linear-gradient(to_right,hsla(220,13%,0%,.3)_40%,hsla(220,13%,0%,1)_80%)] opacity-0 pointer-events-none transition-opacity duration-[800ms] [transition-timing-function:cubic-bezier(.7,0,.2,1)] [will-change:opacity] [.nav-active_&]:opacity-[.35] [.nav-active_&]:pointer-events-auto max-[540px]:bg-[hsla(220,13%,5%,1)]"
    ></div>
    <div
      class="fixed-nav theme-dark fixed right-0 top-0 z-[100] h-screen bg-[#1C1D20] [transform:translate(calc(100%+6vw),0)_rotate(0.001deg)] transition-transform duration-[800ms] [transition-timing-function:cubic-bezier(.7,0,.2,1)] [will-change:transform] [.nav-active_&]:[transform:translate(0,0)_rotate(0.001deg)] max-[540px]:w-full max-[540px]:[transform:translate(calc(100%+20vw),0)_rotate(0.001deg)] ${TOKENS}"
    >
      <div class="fixed-nav-rounded-div absolute left-px top-0 h-full [transform:translateX(-100%)]">
        <div
          class="rounded-div-wrap relative top-0 h-full w-[6vw] overflow-hidden transition-all duration-[850ms] [transition-timing-function:cubic-bezier(.7,0,.2,1)] [will-change:width] [.nav-active_&]:w-0 max-[540px]:w-[20vw]"
        >
          <div
            class="rounded-div absolute left-1/2 top-1/2 z-[1] block h-[150%] w-[775%] rounded-[50%] bg-[#1C1D20] [transform:translate(-6.5%,-50%)]"
          ></div>
        </div>
      </div>
      <div
        class="fixed-nav-inner relative flex h-full flex-col justify-between px-[7.5vw] pb-[10vh] pt-[15vh] [transform:translate(0,0)_rotate(0.001deg)] transition-all duration-[600ms] [transition-timing-function:cubic-bezier(.7,0,.2,1)] [will-change:transform] max-[540px]:h-[calc(var(--vh,1vh)*100)] max-[540px]:px-[var(--container-padding)] max-[540px]:pb-[calc(var(--gap-padding)*1.25)] max-[540px]:pt-[calc(var(--vh,1vh)*15)] max-[540px]:[transform:translate(20vw,0)_rotate(0.001deg)] max-[540px]:delay-0 max-[540px]:[.nav-active_&]:[transform:translate(0,0)_rotate(0.001deg)] max-[540px]:[.nav-active_&]:delay-[100ms]"
      >
        <div class="row nav-row relative flex flex-wrap">
          <h5 class="${H5} mb-[3em] w-full">Navigation</h5>
          <div class="stripe ${STRIPE_LIGHT}"></div>
          <ul
            class="links-wrap group/links flex w-full flex-col items-start list-none p-0 pt-[5vh] ml-[calc(var(--gap-padding)/-2)] max-[540px]:pb-[3vh] max-[540px]:pt-[3vh]"
          >
            ${links}
          </ul>
        </div>
        ${socialsMarkup()}
      </div>
    </div>`;
}

// --- Behaviour -----------------------------------------------------------

// Everything wired to `window`/`document` for one page, so the next Barba
// container doesn't stack a second copy of every listener on top of the first.
let teardown: AbortController | null = null;

const isDesktop = () => window.innerWidth > 540;

// The reference tracks `--vh` in JS because mobile browsers change what `100vh`
// means when their chrome collapses, which would otherwise jump the height of
// an already-open sidebar mid-scroll.
function trackViewportHeight(signal: AbortSignal) {
  const update = () =>
    document.documentElement.style.setProperty("--vh", `${window.innerHeight / 100}px`);
  update();
  window.addEventListener("resize", update, { signal });
}

// Pulls the button toward the cursor, with the label trailing at half strength,
// and springs back elastically on exit.
function initMagneticButtons(root: ParentNode, signal: AbortSignal) {
  root.querySelectorAll<HTMLElement>(".btn-click.magnetic").forEach((magnet) => {
    const text = magnet.querySelector(".btn-text");
    const fill = magnet.querySelector(".btn-fill");

    if (isDesktop()) {
      magnet.addEventListener(
        "mousemove",
        (event) => {
          const bounds = magnet.getBoundingClientRect();
          const strength = Number(magnet.dataset.strength ?? 0);
          const strengthText = Number(magnet.dataset.strengthText ?? 0);
          const ratioX = (event.clientX - bounds.left) / magnet.offsetWidth - 0.5;
          const ratioY = (event.clientY - bounds.top) / magnet.offsetHeight - 0.5;

          gsap.to(magnet, {
            x: ratioX * strength,
            y: ratioY * strength,
            rotate: 0.001,
            duration: 1.5,
            ease: "power4.out",
          });
          if (text) {
            gsap.to(text, {
              x: ratioX * strengthText,
              y: ratioY * strengthText,
              rotate: 0.001,
              duration: 1.5,
              ease: "power4.out",
            });
          }
        },
        { signal }
      );

      magnet.addEventListener(
        "mouseleave",
        () => {
          gsap.to(magnet, { x: 0, y: 0, duration: 1.5, ease: "elastic.out" });
          if (text) gsap.to(text, { x: 0, y: 0, duration: 1.5, ease: "elastic.out" });
        },
        { signal }
      );
    }

    // The circular fill sweeps up from below the button on enter and retreats
    // further upward on leave, so it never reverses back the way it came in.
    if (!fill) return;
    magnet.addEventListener(
      "mouseenter",
      () => {
        gsap.to(fill, { startAt: { y: "76%" }, y: "0%", duration: 0.6, ease: "power2.inOut" });
      },
      { signal }
    );
    magnet.addEventListener(
      "mouseleave",
      () => {
        gsap.to(fill, { y: "-76%", duration: 0.6, ease: "power2.inOut" });
      },
      { signal }
    );
  });
}

function initHamburgerNav(
  root: HTMLElement,
  signal: AbortSignal,
  hooks: { onOpen?: () => void; onClose?: () => void }
) {
  const triggers = root.querySelectorAll<HTMLElement>(".btn-hamburger, .btn-menu");
  const backdrop = root.querySelector<HTMLElement>(".fixed-nav-back");

  const close = () => {
    if (!root.classList.contains("nav-active")) return;
    triggers.forEach((trigger) => trigger.classList.remove("active"));
    root.classList.remove("nav-active");
    hooks.onClose?.();
  };

  const open = () => {
    triggers.forEach((trigger) => trigger.classList.add("active"));
    root.classList.add("nav-active");
    hooks.onOpen?.();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener(
      "click",
      () => (root.classList.contains("nav-active") ? close() : open()),
      { signal }
    );
  });

  backdrop?.addEventListener("click", close, { signal });
  document.addEventListener("keydown", (event) => event.key === "Escape" && close(), { signal });

  // Following a route swaps this container out from under the open panel;
  // dropping the state first is what releases the scroll lock either way.
  root.querySelectorAll<HTMLAnchorElement>(".fixed-nav a[href^='/']").forEach((link) => {
    link.addEventListener("click", close, { signal });
  });
}

// `.scrolled` gates the floating hamburger. Locomotive drives it via
// updateNavScrolled() where a smooth-scroll container exists; plain pages fall
// back to window scroll here.
function initScrollState(root: HTMLElement, signal: AbortSignal) {
  if (root.querySelector("[data-scroll-container]")) return;
  const update = () => updateNavScrolled(root, window.scrollY);
  update();
  window.addEventListener("scroll", update, { signal, passive: true });
}

export function updateNavScrolled(root: HTMLElement, scrollY: number) {
  root.classList.toggle("scrolled", scrollY > window.innerHeight * 0.3);
}

/**
 * Renders the nav into `[data-nav-bar]` / `[data-nav-overlay]` inside a Barba
 * container and wires up its interactions. `data-nav-theme="light"` on the bar
 * hook flips the top bar to dark text for pages with a light hero.
 */
export function initNav(
  container: HTMLElement,
  namespace: string,
  hooks: { onOpen?: () => void; onClose?: () => void } = {}
) {
  teardown?.abort();
  teardown = new AbortController();
  const { signal } = teardown;

  const barHost = container.querySelector<HTMLElement>("[data-nav-bar]");
  const overlayHost = container.querySelector<HTMLElement>("[data-nav-overlay]");
  if (barHost) {
    const theme: NavTheme = barHost.dataset.navTheme === "light" ? "light" : "dark";
    barHost.innerHTML = navBarMarkup(namespace, theme);
  }
  if (overlayHost) {
    overlayHost.innerHTML = hamburgerMarkup() + sidebarMarkup(namespace);
  }

  trackViewportHeight(signal);
  initMagneticButtons(container, signal);
  initHamburgerNav(container, signal, hooks);
  initScrollState(container, signal);
}
