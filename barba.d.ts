declare module "@barba/core" {
  export interface BarbaTransitionData {
    current: {
      container: HTMLElement;
      namespace: string;
      url: {
        hash: string;
        href: string;
        path: string;
        port: number | null;
        query: Record<string, string>;
      };
    };
    next: {
      container: HTMLElement;
      namespace: string;
      url: {
        hash: string;
        href: string;
        path: string;
        port: number | null;
        query: Record<string, string>;
      };
    };
    trigger: HTMLElement | null;
  }

  export interface BarbaHooks {
    before?: (data: BarbaTransitionData) => Promise<void> | void;
    beforeLeave?: (data: BarbaTransitionData) => Promise<void> | void;
    leave?: (data: BarbaTransitionData) => Promise<void> | void;
    afterLeave?: (data: BarbaTransitionData) => Promise<void> | void;
    beforeEnter?: (data: BarbaTransitionData) => Promise<void> | void;
    enter?: (data: BarbaTransitionData) => Promise<void> | void;
    afterEnter?: (data: BarbaTransitionData) => Promise<void> | void;
    after?: (data: BarbaTransitionData) => Promise<void> | void;
  }

  export interface BarbaTransition extends BarbaHooks {
    name: string;
    to?: string | RegExp | string[] | RegExp[];
    from?: string | RegExp | string[] | RegExp[];
    once?: (data: BarbaTransitionData) => Promise<void> | void;
  }

  export interface BarbaView {
    namespace: string;
    beforeEnter?: (data: { container: HTMLElement }) => void;
    afterEnter?: (data: { container: HTMLElement }) => void;
    beforeLeave?: (data: { container: HTMLElement }) => void;
    afterLeave?: (data: { container: HTMLElement }) => void;
  }

  export interface BarbaOptions {
    transitions?: BarbaTransition[];
    views?: BarbaView[];
    debug?: boolean;
    prefetch?: boolean;
    timeout?: number;
    preventRunning?: boolean;
  }

  export interface BarbaPrefetchPlugin {
    name: string;
    version: string;
    install(barba: unknown): void;
  }

  const barba: {
    init: (options?: BarbaOptions) => void;
    use: (
      plugin: BarbaPrefetchPlugin,
      options?: Record<string, unknown>
    ) => void;
    destroy: () => void;
    go: (href: string, options?: Record<string, unknown>) => void;
  };

  export default barba;
}

declare module "@barba/prefetch" {
  import { BarbaPrefetchPlugin } from "@barba/core";
  const prefetch: BarbaPrefetchPlugin;
  export default prefetch;
}
