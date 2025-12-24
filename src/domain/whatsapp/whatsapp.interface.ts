import { DrizzleRepository } from "@/domain/drizzle/drizzle.repository";
import { Level } from "@/domain/whatsapp/whatsapp.types";

export type BrowserName = "Chrome" | "Firefox" | "Safari" | "Edge";

export interface AdvancedWhatsappInterface {
  onAuthRequired: (code: string) => Promise<void>;
  onFail: (err: string) => Promise<void>;
  onFatalFail: (err: string) => Promise<void>;
  onSuccess: () => Promise<void>;
  onRestartRequired: () => Promise<void>;
}

export interface BasicWhatsappInterface {
  sessionId: string;
  phoneNumber: string;
  log: Level;
  isPairCode: boolean;
  timeReconnect: number;
}

export interface WhatsappInterface {
  basic: BasicWhatsappInterface;
  advanced: AdvancedWhatsappInterface;
  drizzle: DrizzleRepository;
}
