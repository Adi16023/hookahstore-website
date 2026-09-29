export const runtime = 'edge';
import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
    title: 'Create A New Password',
    description: 'Set a new password for your Hookah Store account.',
};

export default function ResetPasswordPage() {
    return <ResetPasswordClient />;
}
