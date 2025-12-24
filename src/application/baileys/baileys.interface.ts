import {
  AnyMessageContent,
  BaileysEventMap,
  WAMessage,
  WASocket,
} from "baileys";

export interface BaileysServiceInterface {
  sendMessage(
    phoneNumber: string,
    message: AnyMessageContent
  ): Promise<WAMessage | undefined>;
  onEvent(
    event: keyof BaileysEventMap,
    callback: (...args: any[]) => void
  ): Promise<void>;
  offEvent(
    event: keyof BaileysEventMap,
    callback: (...args: any[]) => void
  ): Promise<void>;
  isConnected(): boolean;
  logout(): Promise<void>;
  exit(): Promise<void>;
  others: WASocket;
}
