import { WASocket } from "baileys";

export class BaileysEntity {
  private constructor(private readonly _socket: WASocket) {}

  public static async build(socket: WASocket): Promise<BaileysEntity> {
    return new BaileysEntity(socket);
  }

  get socket(): WASocket {
    return this._socket;
  }
}
