import {
  AuthenticationCreds,
  SignalDataTypeMap,
  proto,
  BufferJSON,
  initAuthCreds,
} from "baileys";
import {
  WhatsappRepositoryInterface,
  WhatsappSessionInterface,
} from "@/domain/whatsapp/whatsapp.repository";
import { DrizzleRepository } from "@/domain/drizzle/drizzle.repository";
import { sql } from "drizzle-orm";

export class WhatsappSessionRepository implements WhatsappRepositoryInterface {
  private constructor(private readonly drizzleClient: DrizzleRepository) {}

  public static build(drizzleClient: DrizzleRepository) {
    return new WhatsappSessionRepository(drizzleClient);
  }

  private async writeSessionData(
    sessionId: string,
    id: string,
    data: any
  ): Promise<void> {
    const normalizedId = this.normalizeId(id);
    const jsonData = JSON.stringify(data, BufferJSON.replacer);

    await this.drizzleClient.execute(
      sql`
      INSERT INTO session (session_id, id, data)
      VALUES (${sessionId}, ${normalizedId}, ${jsonData})
      ON CONFLICT (session_id, id)
      DO UPDATE
        SET data = EXCLUDED.data
    `
    );
  }

  private async readSessionData(
    sessionId: string,
    id: string,
    logs = false
  ): Promise<any> {
    try {
      const result = await this.drizzleClient.execute(
        sql`
    SELECT data
    FROM session
    WHERE session_id = ${sessionId}
      AND id = ${this.normalizeId(id)}
    LIMIT 1
  `
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Session not found");
      }

      const row = result.rows[0] as { data: string };
      return JSON.parse(row.data, BufferJSON.reviver);
    } catch (e) {
      if (logs) {
        console.log(
          { id, sessionId },
          "Session data not found or error during read"
        );
      }
      return null;
    }
  }

  private async deleteSessionData(
    sessionId: string,
    id?: string
  ): Promise<void> {
    if (id) {
      await this.drizzleClient.execute(
        sql`
        DELETE FROM session
        WHERE session_id = ${sessionId}
          AND id = ${this.normalizeId(id)}
      `
      );
    } else {
      await this.drizzleClient.execute(
        sql`
        DELETE FROM session
        WHERE session_id = ${sessionId}
      `
      );
    }
  }

  async session(
    sessionId: string,
    logs: boolean = false
  ): Promise<WhatsappSessionInterface> {
    const creds: AuthenticationCreds =
      (await this.readSessionData(sessionId, "creds", logs)) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async <T extends keyof SignalDataTypeMap>(
            type: T,
            ids: string[]
          ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
            const data: { [id: string]: SignalDataTypeMap[T] } = {};

            await Promise.all(
              ids.map(async (id) => {
                let value = await this.readSessionData(
                  sessionId,
                  `${type}-${id}`
                );
                if (type === "app-state-sync-key" && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }

                if (value) {
                  data[id] = value as SignalDataTypeMap[T];
                }
              })
            );

            return data;
          },
          set: async (data: any) => {
            const tasks: Promise<void>[] = [];

            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const sId = `${category}-${id}`;
                tasks.push(
                  value
                    ? this.writeSessionData(sessionId, sId, value)
                    : this.deleteSessionData(sessionId, sId)
                );
              }
            }
            await Promise.all(tasks);
          },
        },
      },
      saveCreds: () => this.writeSessionData(sessionId, "creds", creds),
      delete: () => this.deleteSessionData(sessionId),
    };
  }

  public get drizzle() {
    return this.drizzleClient;
  }

  private normalizeId(id: string) {
    return id.replace(/\//g, "__").replace(/:/g, "-");
  }
}
