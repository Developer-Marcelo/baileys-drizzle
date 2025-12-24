export interface ExecuteResult {
  rows?: unknown[];
  rowCount?: number | null;
}

export interface DrizzleRepository {
  execute(query: unknown): Promise<ExecuteResult>;
}
