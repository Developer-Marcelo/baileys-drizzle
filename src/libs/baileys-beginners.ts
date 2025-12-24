import { BaileysServiceInterface } from "@/application/baileys/baileys.interface";
import {
  BrowserName,
  WhatsappInterface,
} from "@/domain/whatsapp/whatsapp.interface";
import { BaileysFactory } from "@/infrastructure/factories/baileys.factory";

export class BaileysBeginner {
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

  public get beginner(): BaileysServiceInterface {
    if (!this._baileysService) {
      throw new Error("Baileys service not initialized");
    }
    return this._baileysService;
  }
}
