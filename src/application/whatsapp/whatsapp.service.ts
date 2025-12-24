import { WhatsappRepositoryInterface } from "@/domain/whatsapp/whatsapp.repository";
import { AuthenticationState } from "baileys";

export class WhatsappSessionService {
  private constructor(
    private readonly whatsappSessionRepository: WhatsappRepositoryInterface
  ) {}

  public static build(whatsappSessionRepository: WhatsappRepositoryInterface) {
    return new WhatsappSessionService(whatsappSessionRepository);
  }

  public async session(
    sessionId: string,
    logs: boolean = true
  ): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
    delete: (sessionId: string) => Promise<void>;
  }> {
    return await this.whatsappSessionRepository.session(sessionId, logs);
  }
}
