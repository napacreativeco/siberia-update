import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {useEffect} from 'react';

import {PageHeader} from '~/components';
import {CACHE_LONG, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

import About from '~/components/About';

export const headers = routeHeaders;

/*
  Loader
*/
export async function loader({request, params, context}) {
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({page, url: request.url});

  return json(
    {page, seo},
    {
      headers: {
        'Cache-Control': CACHE_LONG,
      },
    },
  );
}

/*
  Page
*/
export default function Page() {
  const {page} = useLoaderData();

  useEffect(() => {
    console.log(page)
  });

  if (page.title === 'About') {

    return (
      <div className="about about-page">
        <About page={page} title={page.title} gallery={page.gallery.value} />
          <img src={page.featured.value} alt="" />
      </div>     
    );

  } else {

    return (
      <div className="default-page">
        <PageHeader heading={page.title}>
          <div
            dangerouslySetInnerHTML={{__html: page.body}}
            className="prose dark:prose-invert"
          />
        </PageHeader>
      </div>
    );

  }
  
}


const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
      gallery: metafield(
          namespace: "pages"
          key: "gallery"
        ) {
          value
          namespace
          key
      },
      featured: metafield(
        namespace: "pages",
        key: "featured_image"
      ) {
        value
        namespace
        key
      }
    }
  }
`;
