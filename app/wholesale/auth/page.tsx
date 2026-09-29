export const runtime = 'edge';
import { permanentRedirect } from 'next/navigation';

// Old duplicate login/registration page — registration lives at /wholesale/register.
// (A page-level redirect rather than next.config redirects, because on the
// wholesale subdomain /auth is rewritten to /wholesale/auth by middleware.)
export default function WholesaleAuthRedirect() {
    permanentRedirect('/wholesale/register');
}
