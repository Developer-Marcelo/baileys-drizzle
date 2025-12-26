# Baileys + Drizzle ORM 🚀🚀🚀

Gerencie sessões do WhatsApp com Baileys usando Drizzle ORM.  
Manage WhatsApp sessions with Baileys using Drizzle ORM.

Maintained and developed by Marcelo BRBX.
This is my first official NPM package, designed to simplify WhatsApp Baileys integrations for the community.

A high-level, Clean Architecture–based wrapper for the Baileys library.
This project simplifies WhatsApp integration by handling session management, connection states, and automatic reconnections internally.

✨ Key Features

- Clean Architecture & SOLID
  Logic separated into Domain, Application, and Infrastructure layers for high maintainability.

- Persistent Sessions (Drizzle ORM)
  Authentication state is safely stored in your database.

- Automatic Reconnection
  Handles network issues and the Restart Required (515) error internally without crashing the process.

- Easy Authentication
  Supports both QR Code and Pairing Code (Phone Number) methods.

- Event-Driven
  Simple callbacks for success, failure, and authentication requirements.

- Developer Friendly
  Complex Baileys socket logic is hidden behind a clean Facade.

License

MIT

🛠️ Tech Stack

Runtime: Node.js / TypeScript

WA Library: baileys

Database: Drizzle ORM

Logging: Pino

⚠️ Drizzle Schema (REQUIRED)

This library will NOT work without the following Drizzle model.

You MUST add this model to your schema.drizzle.ts:

```
import {
  pgTable,
  bigserial,
  varchar,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const session = pgTable(
  "session",
  {
    pkId: bigserial("pk_id", { mode: "bigint" }).primaryKey(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    id: varchar("id", { length: 255 }).notNull(),
    data: text("data").notNull(),
  },
  (table) => [
    uniqueIndex("unique_id_per_session_id_session").on(
      table.sessionId,
      table.id
    ),
    index("session_session_id_idx").on(table.sessionId),
  ]
);

```

📋 Prerequisites (Pre-configuration)

Before installing and using npm install baileys-drizzle, you must ensure your environment is ready.

Database & Drizzle Setup

```
// drizzle-client.ts example
import "dotenv/config";
import { drizzle as drizzleOrm } from "drizzle-orm/node-postgres";

export const drizzle = drizzleOrm(process.env.DATABASE_URL!);

```

🚀 Getting Started Production

1. Installation

```
npm install baileys-drizzle
```

2. Basic Usage

You don't need to manage sockets or handle complex reconnection logic. Simply instantiate the library and start.

```
import { drizzle } from "./db/drizzle";
import { interceptSessionLogs, WhatsappInterface } from "baileys-drizzle";
import { BaileysDrizzle } from "baileys-drizzle";

const sessionId = "default";
const phoneNumber = "5521999999998";
const browserName = "Chrome";

const baileysDrizzle = new BaileysDrizzle(sessionId, browserName);

interceptSessionLogs({
  ClosingSession: () => console.log("🔐 Renovação de chaves de sessão 123"),
  OpeningSession: () => console.log("🟢 Sessão criptográfica aberta 123"),
  RemovingOldClosedSession: () =>
    console.log("🧹 Limpando sessões criptográficas antigas 123"),
  MigratingSessionTo: (code) =>
    console.log("🔄 Migrando estrutura de sessão123:", code),
  SessionAlreadyClosed: () => console.log("⚠️ Sessão já estava encerrada 123"),
  SessionAlreadyOpen: () => console.log("⚠️ Sessão já estava aberta 123"),
  SessionStorageMigrationError: () =>
    console.log("❌ Erro ao migrar armazenamento de sessão criptográfica 123"),
});

const config: WhatsappInterface = {
  basic: {
    sessionId,
    phoneNumber,
    isPairCode: true,
    timeReconnect: 3,
    log: "silent",
  },
  advanced: {
    onAuthRequired: async (code) => console.log("onAuthRequired", code),
    onFail: async (err) => console.log("onFail", err),
    onFatalFail: async (err) => console.log("onFatalFail", err),
    onSuccess: async () => console.log("onSuccess"),
    onRestartRequired: async () => console.log("onRestartRequired"),
  },
  drizzle,
};

await baileysDrizzle.start(config);

const phoneExample = "5521999999999";

/*
  const baileys = baileysDrizzle.baileys;
*/

setInterval(() => {
  if (baileysDrizzle.isConnected) {
    baileysDrizzle.sendMessage(phoneExample, {
      text: "Hello, World!",
    });
  }
}, 30000);

```

🔒 Session Logs Interception (Optional)

This library provides a fine-grained log interception system that allows you to handle specific Baileys session events via dedicated callbacks.

If you don't provide these callbacks, the logs will still print normally to the console.

Example: Using Specific Session Callbacks

```
import { interceptSessionLogs } from "baileys-drizzle";

interceptSessionLogs({
  ClosingSession: () => console.log("🔐 Renovação de chaves de sessão"),
  OpeningSession: () => console.log("🟢 Sessão criptográfica aberta"),
  RemovingOldClosedSession: () => console.log("🧹 Limpando sessões criptográficas antigas"),
  MigratingSessionTo: (code) => console.log("🔄 Migrando estrutura de sessão:", code),
  SessionAlreadyClosed: () => console.log("⚠️ Sessão já estava encerrada"),
  SessionAlreadyOpen: () => console.log("⚠️ Sessão já estava aberta"),
  SessionStorageMigrationError: () =>
    console.log("❌ Erro ao migrar armazenamento de sessão criptográfica"),
});

```

Available Callbacks

Event Description
ClosingSession Called when the session is being closed.
OpeningSession Called when the session is being opened.
RemovingOldClosedSession Called when old closed sessions are being removed.
MigratingSessionTo Called when the session is being migrated to a new structure.
SessionAlreadyClosed Called when the session is already closed.
SessionAlreadyOpen Called when the session is already open.
SessionStorageMigrationError Called when there is an error migrating the session storage.

| Note: If no callback is provided for an event, the log will print normally to the console.
