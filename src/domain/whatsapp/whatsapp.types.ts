import type { BaileysEventMap } from "baileys";

export type BaileysEventHandler<T extends keyof BaileysEventMap> = (
  args: BaileysEventMap[T]
) => void;

export type Level =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "silent";
