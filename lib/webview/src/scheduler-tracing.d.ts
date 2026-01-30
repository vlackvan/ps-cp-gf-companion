// Workaround for React 18 + TypeScript issue with scheduler/tracing
// See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/56210
declare module "scheduler/tracing" {
  export interface Interaction {
    __count: number;
    id: number;
    name: string;
    timestamp: number;
  }

  export const __interactionsRef: any;
  export const __subscriberRef: any;
  export function unstable_clear(callback: () => void): void;
  export function unstable_getCurrent(): any;
  export function unstable_getThreadID(): number;
  export function unstable_subscribe(subscriber: any): void;
  export function unstable_trace(
    name: string,
    timestamp: number,
    callback: () => void,
    threadID?: number
  ): void;
  export function unstable_unsubscribe(subscriber: any): void;
  export function unstable_wrap(callback: () => void, threadID?: number): any;
}
