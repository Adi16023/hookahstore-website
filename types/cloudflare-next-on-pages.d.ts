/**
 * Minimal types for @cloudflare/next-on-pages.
 * The package only exposes its entry through package.json "exports", which
 * tsconfig's moduleResolution "node" can't read; webpack resolves it fine.
 * Only the API used by lib/utils/background.ts is declared.
 */
declare module '@cloudflare/next-on-pages' {
    export function getRequestContext(): {
        env: Record<string, unknown>;
        cf: unknown;
        ctx: { waitUntil(promise: Promise<unknown>): void };
    };
}
