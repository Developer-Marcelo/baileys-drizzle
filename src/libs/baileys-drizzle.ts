import { BaileysServiceInterface } from "@/application/baileys/baileys.interface";
import {
  BrowserName,
  WhatsappInterface,
} from "@/domain/whatsapp/whatsapp.interface";
import { BaileysFactory } from "@/infrastructure/factories/baileys.factory";
import { AnyMessageContent, WASocket } from "baileys";

export class BaileysDrizzle {
  private _baileysService: BaileysServiceInterface | null = null;

  constructor(
    private readonly sessionId: string,
    private readonly browserName: BrowserName
  ) {}

  public async start(config: WhatsappInterface): Promise<void> {
    await this.internalStart(config);
  }

  private async internalStart(config: WhatsappInterface): Promise<void> {
    const { connectionService, baileysService } = await BaileysFactory.create(
      this.sessionId,
      this.browserName,
      config.drizzle,
      config.basic.log
    );

    this._baileysService = baileysService;

    const internalConfig: WhatsappInterface = {
      ...config,
      advanced: {
        ...config.advanced,
        onRestartRequired: async () => {
          await this.internalStart(config);
        },
      },
    };

    await connectionService.execute(internalConfig);
  }

  public get baileysDrizzle(): BaileysServiceInterface {
    if (!this._baileysService) {
      throw new Error("Baileys service not initialized");
    }
    return this._baileysService;
  }

  public get isConnected(): boolean {
    return this.baileysDrizzle.isConnected();
  }

  public async sendMessage(
    phoneNumber: string,
    message: AnyMessageContent
  ): Promise<void> {
    try {
      await this.baileysDrizzle.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  public async exit(): Promise<void> {
    try {
      await this.baileysDrizzle.exit();
    } catch (error) {
      console.error("Error exiting Baileys service:", error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.baileysDrizzle.logout();
    } catch (error) {
      console.error("Error logging out Baileys service:", error);
      throw error;
    }
  }

  public get baileys(): WASocket {
    return this.baileysDrizzle.others;
  }
}
