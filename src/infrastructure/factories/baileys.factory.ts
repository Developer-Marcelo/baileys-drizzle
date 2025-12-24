import { WhatsappSessionService } from "@/application/whatsapp/whatsapp.service";
import { BaileysEntity } from "@/domain/baileys/baileys.entity";
import { WhatsappSessionRepository } from "@/infrastructure/database/drizzle/whatsapp-session.repository";
import { WhatsappConnectionService } from "@/application/whatsapp/whatsapp-connection.service";
import { BrowserName } from "@/domain/whatsapp/whatsapp.interface";
import { BaileysProvider } from "../providers/baileys-provider";
import { WhatsappSessionInterface } from "@/domain/whatsapp/whatsapp.repository";
import { BaileysService } from "@/application/baileys/baileys.service";
import { DrizzleSessionStore } from "@/infrastructure/database/drizzle/drizzle-session-store";
import { DrizzleRepository } from "@/domain/drizzle/drizzle.repository";
import makeWASocket, { Browsers } from "baileys";
import P from "pino";
import { Level } from "@/domain/whatsapp/whatsapp.types";

export class BaileysFactory {
  private constructor() {}

  public static async create(
    sessionId: string,
    browserName: BrowserName,
    drizzle: DrizzleRepository,
    logPino: Level
  ): Promise<{
    socket: BaileysEntity;
    connectionService: WhatsappConnectionService;
    session: WhatsappSessionInterface;
    baileysService: BaileysService;
    drizzle: DrizzleRepository;
  }> {
    const drizzleClient = DrizzleSessionStore.build(drizzle);
    const repository = WhatsappSessionRepository.build(drizzleClient.drizzle);
    const whatsappService = WhatsappSessionService.build(repository);
    const sessionCreate = await whatsappService.session(sessionId, false);

    const socket = makeWASocket({
      auth: sessionCreate.state,
      logger: P({ level: logPino }),
      browser: Browsers.appropriate(browserName),
    });

    const provider = new BaileysProvider(socket);

    const connectionService = new WhatsappConnectionService(
      provider,
      sessionCreate
    );

    const baileysEntity = await BaileysEntity.build(socket);
    const baileysService = BaileysService.build(baileysEntity);
    baileysService;
    return {
      socket: baileysEntity,
      connectionService,
      session: sessionCreate,
      baileysService,
      drizzle: drizzleClient.drizzle,
    };
  }
}
