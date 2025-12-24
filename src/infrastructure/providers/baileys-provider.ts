import { WASocket, DisconnectReason } from "baileys";
import {
  ConnectionProviderInterface,
  ConnectionUpdate,
} from "@/domain/whatsapp/connection-provider.interface";

export class BaileysProvider implements ConnectionProviderInterface {
  constructor(private readonly socket: WASocket) {}

  onUpdate(callback: (update: ConnectionUpdate) => Promise<void>): void {
    this.socket.ev.on("connection.update", callback);
  }

  onCredsUpdate(callback: () => Promise<void>): void {
    this.socket.ev.on("creds.update", callback);
  }

  async requestPairingCode(phoneNumber: string): Promise<string> {
    return await this.socket.requestPairingCode(phoneNumber);
  }

  static isFatalError(statusCode: number): boolean {
    return [
      DisconnectReason.loggedOut,
      DisconnectReason.badSession,
      DisconnectReason.forbidden,
    ].includes(statusCode);
  }
}
