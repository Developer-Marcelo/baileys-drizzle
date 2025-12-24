export interface SessionLogCallbacks {
  ClosingSession?: () => void;
  OpeningSession?: () => void;
  RemovingOldClosedSession?: () => void;
  MigratingSessionTo?: (code?: string) => void;
  SessionAlreadyClosed?: () => void;
  SessionAlreadyOpen?: () => void;
  SessionStorageMigrationError?: () => void;
}
