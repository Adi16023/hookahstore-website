export const runtime = 'edge';
import HomePageContent from '../../components/pages/HomePageContent';
import {
    fetchGraphQLSafe,
    GET_HOME_HERO_SLIDES,
    fetchHomepageBrands,
    GET_POSTS_QUERY,
    type AcfHeroSlide,
    type WPPost,
    type HomepageBrandsData,
} from '../../lib/graphql';

// ISR: rebuild homepage at most every 5 minutes.
// All fetch calls must use revalidate ≤ 300 to stay within this window.
export const revalidate = 300;

type HeroSlideData = {
    page?: {
        heroSlider?: {
            slides?: AcfHeroSlide[] | null;
        } | null;
    } | null;
};

export default async function HomePage() {
    // Fetch hero slides and brand products in parallel — both ISR-cached for 5 min.
    // fetchGraphQLSafe returns null on error rather than throwing, so the page
    // always renders even if WordPress is temporarily unreachable.
    const [heroData, brandsData, postsData] = await Promise.all([
        fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 300) as Promise<HeroSlideData | null>,
        fetchHomepageBrands(300) as Promise<HomepageBrandsData>,
        fetchGraphQLSafe(GET_POSTS_QUERY, { first: 3 }, 300) as Promise<{ posts?: { nodes?: WPPost[] } } | null>,
    ]);

    const acfSlides: AcfHeroSlide[] = heroData?.page?.heroSlider?.slides ?? [];

    return (
        <HomePageContent
            isWholesale={false}
            acfHeroSlides={acfSlides}
            brandProducts={brandsData}
            blogPosts={postsData?.posts?.nodes ?? []}
        />
    );
}
