import { WhatsappSessionInterface } from "@/domain/whatsapp/whatsapp.repository";

export class WhatsappEntity {
  private constructor(
    private readonly whatsappSession: WhatsappSessionInterface
  ) {}

  static build(whatsappSession: WhatsappSessionInterface) {
    return new WhatsappEntity(whatsappSession);
  }

  get session() {
    return this.whatsappSession;
  }
}
