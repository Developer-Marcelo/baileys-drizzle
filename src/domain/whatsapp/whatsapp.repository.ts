import { AuthenticationState } from "baileys";

export interface WhatsappSessionInterface {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  delete(sessionId: string): Promise<void>;
}

export interface WhatsappRepositoryInterface {
  session(sessionId: string, logs: boolean): Promise<WhatsappSessionInterface>;
}
