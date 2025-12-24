import { ConnectionState } from "baileys";

export interface ConnectionProviderInterface {
  onUpdate(callback: (update: ConnectionUpdate) => Promise<void>): void;
  onCredsUpdate(callback: () => Promise<void>): void;
  requestPairingCode(phoneNumber: string): Promise<string>;
}

export type ConnectionUpdate = {
  connection?: ConnectionState["connection"];
  qr?: ConnectionState["qr"];
  lastDisconnect?: Partial<ConnectionState["lastDisconnect"]>;
};
