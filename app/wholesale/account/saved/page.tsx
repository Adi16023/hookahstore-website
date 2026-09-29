export const runtime = 'edge';
import { permanentRedirect } from 'next/navigation';

// "Saved products" was a placeholder and has been removed from the account menu.
export default function WholesaleSavedRedirect() {
    permanentRedirect('/wholesale/account');
}
