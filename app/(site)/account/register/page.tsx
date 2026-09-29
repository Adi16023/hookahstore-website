export const runtime = 'edge';
import type { Metadata } from 'next';
import CreateAccountClient from './CreateAccountClient';

export const metadata: Metadata = {
    title: 'Create an Account',
    description: 'Create your account at The Hookah Store for fast checkout, loyalty rewards, exclusive offers, and more.',
};

export default function CreateAccountPage() {
    return <CreateAccountClient />;
}
