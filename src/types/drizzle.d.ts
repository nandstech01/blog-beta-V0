declare module 'better-sqlite3' {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: Function;
  }

  interface Statement<T> {
    run(...params: any[]): RunResult;
    get(...params: any[]): T;
    all(...params: any[]): T[];
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  class SqliteError extends Error {
    code: string;
    constructor(message: string);
  }

  class Database {
    constructor(filename: string, options?: DatabaseOptions);
    transaction<T>(fn: () => T): () => T;
    prepare<T = unknown>(sql: string): Statement<T>;
    exec(sql: string): void;
    close(): void;
    pragma(pragma: string, options?: { simple?: boolean }): any;
  }

  namespace Database {
    export { DatabaseOptions, Statement, RunResult, SqliteError };
  }

  export = Database;
}

declare module 'drizzle-orm/sqlite-core' {
  export interface BaseSQLiteDatabase<TType extends "sync" | "async", TSchema extends Record<string, unknown>> {
    query: any;
    select: any;
    insert: any;
    update: any;
    delete: any;
    run: any;
    all: any;
    get: any;
    values: any;
    execute: any;
  }

  export interface ColumnBuilderConfig {
    name?: string;
    notNull?: boolean;
    default?: unknown;
    primaryKey?: boolean;
    mode?: string;
    enum?: readonly string[];
  }

  export interface Column<T> {
    name: string;
    type: string;
    notNull(): Column<T>;
    default(value: T): Column<T>;
    primaryKey(): Column<T>;
  }

  export interface SQLiteTable<T = unknown> {
    $inferSelect: T;
    $inferInsert: T;
  }

  export type SQL = {
    append(sql: SQL | string): SQL;
    toQuery(): { sql: string; params: unknown[] };
  };

  export function sql(strings: TemplateStringsArray, ...params: unknown[]): SQL;
  export function text(name?: string, config?: ColumnBuilderConfig): Column<string>;
  export function integer(name?: string, config?: ColumnBuilderConfig): Column<number>;
  export function sqliteTable<T extends Record<string, Column<unknown>>>(name: string, columns: T): T & SQLiteTable<T>;
  export function eq<T>(column: Column<T>, value: T): SQL;
  export function ne<T>(column: Column<T>, value: T): SQL;
  export function gt<T>(column: Column<T>, value: T): SQL;
  export function gte<T>(column: Column<T>, value: T): SQL;
  export function lt<T>(column: Column<T>, value: T): SQL;
  export function lte<T>(column: Column<T>, value: T): SQL;
  export function isNull(column: Column<unknown>): SQL;
  export function isNotNull(column: Column<unknown>): SQL;
  export function and(...conditions: SQL[]): SQL;
  export function or(...conditions: SQL[]): SQL;
}

declare module 'drizzle-orm/better-sqlite3' {
  import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
  import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
  import Database from 'better-sqlite3';

  export * from 'drizzle-orm';
  export * from 'drizzle-orm/sqlite-core';

  export interface BetterSQLite3Database<TSchema extends Record<string, unknown>> extends BaseSQLiteDatabase<"sync", TSchema> {}

  export function drizzle<TSchema extends Record<string, unknown>>(
    client: Database,
    config?: { schema: TSchema }
  ): BetterSQLite3Database<TSchema>;
}

declare module 'drizzle-orm/better-sqlite3/migrator' {
  import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
  
  export interface MigrationConfig {
    migrationsFolder: string;
  }

  export function migrate<TSchema extends Record<string, unknown>>(
    db: BetterSQLite3Database<TSchema>,
    config: MigrationConfig
  ): Promise<void>;
}

declare module 'drizzle-orm' {
  export * from 'drizzle-orm/sqlite-core';
  export * from 'drizzle-orm/better-sqlite3';
  export * from 'drizzle-orm/better-sqlite3/migrator';
}