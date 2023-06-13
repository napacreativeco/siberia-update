import {defer} from '@shopify/remix-oxygen';
import {Suspense, useEffect, useRef} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {AnalyticsPageType} from '@shopify/hydrogen';
import { gsap } from "gsap";
import { ExpoScaleEase, RoughEase, SlowMo } from "gsap/EasePack";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable, ExpoScaleEase, RoughEase, SlowMo);

import HeroNavigation from '~/components/heroNavigation';
import HomeCollection from '~/components/homeCollection';
import About from '~/components/About';
import CartModal from '~/components/CartModal';
import SlimFooter from '~/components/SlimFooter';

import Marquee from "react-fast-marquee";
import NewsletterModal from '~/components/NewsletterModal';


import {ProductSwimlane, FeaturedCollections, Hero} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';

export const headers = routeHeaders;

/*
  Loader
*/
export async function loader({params, context}) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  const seo = seoPayload.home();

  return defer(
    {
      shop,
      primaryHero: hero,
      // These different queries are separated to illustrate how 3rd party content
      // fetching can be optimized for both above and below the fold.
      featuredProducts: context.storefront.query(
        HOMEPAGE_FEATURED_PRODUCTS_QUERY,
        {
          variables: {
            country,
            language,
          },
        },
      ),
      secondaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
        variables: {
          handle: 'backcountry',
          country,
          language,
        },
      }),
      featuredCollections: context.storefront.query(
        FEATURED_COLLECTIONS_QUERY,
        {
          variables: {
            country,
            language,
          },
        },
      ),
      tertiaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
        variables: {
          handle: 'winter-2022',
          country,
          language,
        },
      }),
      analytics: {
        pageType: AnalyticsPageType.home,
      },
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function Homepage() {

  const app = useRef();

  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
  } = useLoaderData();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  useEffect(() => {
    console.log('on effect');

    /* Marquee Scroll */
    window.addEventListener("scroll", () => {

      if (window.scrollY > 100) {

        // Hide Marquee
        gsap.to(".marquee-container", {
            y: 100,
            delay: 0.6,
            duration: 0.2,
            onComplete: () => {
                gsap.to(".marquee-container", { display: "none" });
            }
        });

      } else {

        // Show Marquee
        gsap.to(".marquee-container", {
            y: 0,
            delay: 0.6,
            duration: 0.2,
            onComplete: () => {
                gsap.to(".marquee-container", { display: "block" });
            }
        });
      }
      console.log('scrolling');
    });

    
    /* Newsletter Popup */
    setTimeout(function() {
      gsap.to(".newsletter-modal", {
        display: "flex",
      });
    }, 15000);

  }, []);

  return (
    <div ref={app}>

      {/* NAVIGATION COMPONENET */}
      <HeroNavigation className="box" />

      {/* MODAL */}
      <NewsletterModal />

      {/* MARQUEE */}
      <Marquee autoFill={true} className="marquee-component">
        &nbsp;Our fabric is our honor Let the Last 
      </Marquee>

      {/* MODULES */}
      <section id="modules">

        {/* SHOP */}
        {featuredProducts && (
          <Suspense>
            <Await resolve={featuredProducts}>
              {({products}) => {
                if (!products?.nodes) return <></>;
                return (
                  <HomeCollection
                    products={products.nodes}
                    title="Featured Products"
                    count={32}
                  />
                );
              }}
            </Await>
          </Suspense>
        )}

        {/* ABOUT */}
        <section className="about page-component">
          <About title="about" />
        </section>

      </section>

      <SlimFooter />

    </div>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
