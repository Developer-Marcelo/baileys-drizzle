import { DrizzleRepository } from "@/domain/drizzle/drizzle.repository";

export class DrizzleSessionStore {
  private constructor(private readonly drizzleClient: DrizzleRepository) {}

  public static build(drizzleClient: DrizzleRepository) {
    return new DrizzleSessionStore(drizzleClient);
  }

  public get drizzle() {
    return this.drizzleClient;
  }
}
