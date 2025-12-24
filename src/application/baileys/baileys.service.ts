import { BaileysEntity } from "@/domain/baileys/baileys.entity";
import {
  AnyMessageContent,
  BaileysEventMap,
  WAMessage,
  WASocket,
} from "baileys";
import { BaileysServiceInterface } from "@/application/baileys/baileys.interface";

export class BaileysService implements BaileysServiceInterface {
  private constructor(private readonly baileysEntity: BaileysEntity) {}

  public static build(baileysEntity: BaileysEntity) {
    return new BaileysService(baileysEntity);
  }

  async sendMessage(
    phoneNumber: string,
    message: AnyMessageContent
  ): Promise<WAMessage | undefined> {
    return await this.baileysEntity.socket.sendMessage(
      this.jidTransform(phoneNumber),
      message
    );
  }

  async onEvent(
    event: keyof BaileysEventMap,
    callback: (...args: any[]) => void
  ): Promise<void> {
    this.baileysEntity.socket.ev.on(event, callback);
  }

  async offEvent(
    event: keyof BaileysEventMap,
    callback: (...args: any[]) => void
  ): Promise<void> {
    this.baileysEntity.socket.ev.off(event, callback);
  }

  isConnected(): boolean {
    return this.baileysEntity.socket.ws.isOpen;
  }

  async logout() {
    await this.baileysEntity.socket.logout();
  }

  async exit() {
    this.baileysEntity.socket.ws.close();
  }

  get others(): WASocket {
    return this.baileysEntity.socket;
  }

  private jidTransform(phoneNumber: string): string {
    return `${phoneNumber}@s.whatsapp.net`;
  }
}
