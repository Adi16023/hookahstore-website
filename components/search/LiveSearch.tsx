'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '../../hooks/useDebounce';
import SearchDropdown from './SearchDropdown';

interface Product {
  id: string;
  name: string;
  slug: string;
  price?: string;
  image?: {
    sourceUrl: string;
  };
  productCategories?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface Category {
  name: string;
  slug: string;
}

interface LiveSearchProps {
  mode: 'consumer' | 'wholesale';
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

// GraphQL queries are now handled server-side by /api/search.
// Local query strings removed — no direct WordPress calls from the browser.

/**
 * Extract minimum price from variable product price string
 * Examples:
 *   "₹970.00 - ₹2,070.00" → "₹970.00"
 *   "₹1,500.00" → "₹1,500.00"
 */
function extractMinPrice(priceString: string | null | undefined): string | null {
  if (!priceString) return null;

  const rangeSeparators = [' - ', ' – ', ' — '];
  for (const separator of rangeSeparators) {
    if (priceString.includes(separator)) {
      return priceString.split(separator)[0].trim();
    }
  }

  return priceString;
}

export default function LiveSearch({
  mode,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
}: LiveSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results via the /api/search proxy.
  // The server forwards the request to WordPress GraphQL — no direct WP calls from the browser.
  useEffect(() => {
    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (debouncedQuery.length < 2) {
      setResults([]);
      setCategories([]);
      setTotalCount(0);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&mode=${mode}`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (abortController.signal.aborted) return;

        const rawProducts = data?.products?.nodes || [];

        // Process products: extract minimum price from variable product price ranges
        const products = rawProducts.map((product: any) => {
          const processed = { ...product };
          if (processed.price) {
            processed.price = extractMinPrice(processed.price);
          }
          return processed;
        });

        // Extract unique categories from products (max 4)
        const categoryMap = new Map<string, { name: string; slug: string }>();
        products.forEach((product: any) => {
          if (product.productCategories?.nodes) {
            product.productCategories.nodes.forEach((cat: any) => {
              if (!categoryMap.has(cat.slug)) {
                categoryMap.set(cat.slug, { name: cat.name, slug: cat.slug });
              }
            });
          }
        });

        setResults(products.slice(0, 5));
        setCategories(Array.from(categoryMap.values()).slice(0, 4));
        setTotalCount(products.length);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (mode === 'wholesale') {
        // No wholesale search-results page — Enter opens the top result.
        if (results[0]?.slug) router.push(`/wholesale/product/${results[0].slug}`);
        setIsOpen(false);
        return;
      }
      // Use router.push for SPA navigation — avoids a full page reload.
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  // Prevent search interactions from triggering header menu events
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={handleContainerClick}
    >
      <form role="search" onSubmit={handleSubmit} className="relative w-full h-full">
        <input
          suppressHydrationWarning
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          aria-label="Search products"
          className={inputClassName}
          autoComplete="off"
        />
        <svg
          className="absolute text-white pointer-events-none"
          style={{ right: '20px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </form>

      {isOpen && query.length >= 2 && (
        <SearchDropdown
          products={results}
          categories={categories}
          totalCount={totalCount}
          loading={loading}
          query={query}
          mode={mode}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
