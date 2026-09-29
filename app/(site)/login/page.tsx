export const runtime = 'edge';
import type { Metadata } from 'next';
import LoginClient from '../account/login/LoginClient';

export const metadata: Metadata = {
    title: 'Log In',
    description: 'Log in to your The Hookah Store account to access your orders, rewards, and exclusive member benefits.',
};

export default function LoginPage() {
    return <LoginClient />;
}
