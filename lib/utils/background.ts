/**
 * runInBackground(label, task)
 *
 * On Cloudflare Pages, work still pending when a route returns its response
 * can be cancelled. This registers the task with ctx.waitUntil() so it runs to
 * completion without delaying the response. Outside Cloudflare (next dev /
 * next start) there is no request context, so the task is simply awaited.
 *
 * Use ONLY for non-critical side effects (marketing lists, shipment sync).
 * Emails the customer is waiting for should be awaited directly.
 */
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function runInBackground(label: string, task: Promise<unknown>): Promise<void> {
    const safe = task.then(
        () => undefined,
        (err) => { console.error(`[background] ${label} failed:`, err); },
    );
    try {
        getRequestContext().ctx.waitUntil(safe);
    } catch {
        await safe; // not running on Cloudflare — just finish it here
    }
}
