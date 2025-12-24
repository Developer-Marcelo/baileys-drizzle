import { SessionLogCallbacks } from "../domain/whatsapp/session-logs.interface";

type ConsoleMethod = (...args: any[]) => void;

function wrapConsole(
  original: ConsoleMethod,
  handler: (args: any[]) => boolean
): ConsoleMethod {
  return (...args: any[]) => {
    const handled = handler(args);
    if (!handled) original(...args);
  };
}

export function interceptSessionLogs(callbacks: SessionLogCallbacks) {
  console.info = wrapConsole(console.info, (args) => {
    if (typeof args[0] !== "string") return false;

    if (args[0].startsWith("Closing session:")) {
      callbacks.ClosingSession?.();
      return true;
    }

    if (args[0].startsWith("Opening session:")) {
      callbacks.OpeningSession?.();
      return true;
    }

    if (args[0].startsWith("Removing old closed session:")) {
      callbacks.RemovingOldClosedSession?.();
      return true;
    }

    if (args[0].startsWith("Migrating session to:")) {
      callbacks.MigratingSessionTo?.(args[0]);
      return true;
    }

    return false;
  });

  console.warn = wrapConsole(console.warn, (args) => {
    if (typeof args[0] !== "string") return false;

    if (args[0].startsWith("Session already closed")) {
      callbacks.SessionAlreadyClosed?.();
      return true;
    }

    if (args[0].startsWith("Session already open")) {
      callbacks.SessionAlreadyOpen?.();
      return true;
    }

    return false;
  });

  console.error = wrapConsole(console.error, (args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("session storage migration error")
    ) {
      callbacks.SessionStorageMigrationError?.();
      return true;
    }

    return false;
  });
}
