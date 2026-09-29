/**
 * runInBackground(label, task)
 *
 * Schedules non-critical work to finish after the response is sent.
 * On Vercel, next/server `after()` keeps the task alive via waitUntil.
 * Outside a request (next dev without a request scope) it is awaited instead.
 *
 * Use ONLY for non-critical side effects (marketing lists, shipment sync).
 * Emails the customer is waiting for should be awaited directly.
 */
import { after } from 'next/server';

export async function runInBackground(label: string, task: Promise<unknown>): Promise<void> {
    const safe = task.then(
        () => undefined,
        (err) => { console.error(`[background] ${label} failed:`, err); },
    );
    try {
        after(safe);
    } catch {
        await safe;
    }
}
