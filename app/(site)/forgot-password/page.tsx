export const runtime = 'edge';
import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
    title: 'Reset Your Password',
    description: 'Reset your The Hookah Store account password.',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />;
}
