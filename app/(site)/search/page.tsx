export const runtime = 'edge';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const metadata: Metadata = {
    title: 'Search',
    robots: { index: false, follow: true },
};

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <SearchPageClient />
        </Suspense>
    );
}
