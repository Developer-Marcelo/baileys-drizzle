import { ConnectionProviderInterface } from "@/domain/whatsapp/connection-provider.interface";
import { BaileysProvider } from "@/infrastructure/providers/baileys-provider";
import { WhatsappSessionInterface } from "@/domain/whatsapp/whatsapp.repository";
import { WhatsappInterface } from "@/domain/whatsapp/whatsapp.interface";

export class WhatsappConnectionService {
  constructor(
    private readonly provider: ConnectionProviderInterface,
    private readonly session: WhatsappSessionInterface
  ) {}

  public async execute(options: WhatsappInterface): Promise<void> {
    this.provider.onCredsUpdate(async () => {
      await this.session
        .saveCreds()
        .catch((e) => options.advanced.onFail(e.message));
    });

    this.provider.onUpdate(async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) await this.handleAuth(qr, options);
      if (connection === "open") await options.advanced.onSuccess();
      if (connection === "close")
        await this.handleDisconnection(lastDisconnect?.error, options);
    });
  }

  private async handleAuth(
    qr: string,
    options: WhatsappInterface
  ): Promise<void> {
    try {
      const authData = options.basic.isPairCode
        ? await this.provider.requestPairingCode(options.basic.phoneNumber)
        : qr;

      await options.advanced.onAuthRequired(authData);
    } catch (err) {
      await options.advanced.onFail((err as Error).message);
    }
  }

  private async handleDisconnection(
    error: any,
    options: WhatsappInterface
  ): Promise<void> {
    const statusCode = error?.output?.statusCode;
    const isFatal = BaileysProvider.isFatalError(statusCode);

    if (isFatal) {
      await this.session.delete(options.basic.sessionId);
      return options.advanced.onFatalFail(`Fatal error: ${statusCode}`);
    }

    if (options.advanced.onRestartRequired) {
      await options.advanced.onFail(
        `Restarting connection (Code: ${statusCode})...`
      );

      setTimeout(async () => {
        await options.advanced.onRestartRequired!();
      }, options.basic.timeReconnect * 1000);
    }
  }
}
