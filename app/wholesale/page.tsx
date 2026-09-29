export const runtime = 'edge';
import HomePageContent from '../../components/pages/HomePageContent';
import {
    fetchGraphQLSafe,
    GET_WHOLESALE_HERO_SLIDES,
    GET_POSTS_QUERY,
    type AcfHeroSlide,
    type WPPost,
    type HomepageBrandsData,
} from '../../lib/graphql';
import { fetchWholesaleHomepageBrands } from '../../lib/woocommerce/wholesale-catalog';

// ISR: rebuild wholesale homepage at most every 5 minutes.
export const revalidate = 300;

type HeroSlideData = {
    page?: {
        heroSlider?: {
            slides?: AcfHeroSlide[] | null;
        } | null;
    } | null;
};

export default async function WholesaleHomePage() {
    // Fetch hero slides and brand products in parallel — ISR-cached for 5 min.
    // fetchGraphQLSafe returns null on error so the page always renders.
    const [heroData, brandsData, postsData] = await Promise.all([
        fetchGraphQLSafe(GET_WHOLESALE_HERO_SLIDES, {}, 300) as Promise<HeroSlideData | null>,
        // WooCommerce REST, show_in_wholesale = "1" only, no prices in the payload
        fetchWholesaleHomepageBrands() as Promise<HomepageBrandsData>,
        fetchGraphQLSafe(GET_POSTS_QUERY, { first: 3 }, 300) as Promise<{ posts?: { nodes?: WPPost[] } } | null>,
    ]);

    const acfSlides: AcfHeroSlide[] = heroData?.page?.heroSlider?.slides ?? [];

    return (
        <HomePageContent
            isWholesale={true}
            acfHeroSlides={acfSlides}
            brandProducts={brandsData}
            blogPosts={postsData?.posts?.nodes ?? []}
        />
    );
}

