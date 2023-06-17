import {useRef, Suspense, useMemo, useEffect} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import {AnalyticsPageType, Money, ShopPayButton} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {gsap} from 'gsap';  

import {
  Heading,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';

export const headers = routeHeaders;

/*
  Loader
*/
export async function loader({params, request, context}) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return defer(
    {
      product,
      shop,
      storeDomain: shop.primaryDomain.url,
      recommended,
      analytics: {
        pageType: AnalyticsPageType.product,
        resourceId: product.id,
        products: [productAnalytics],
        totalValue: parseFloat(selectedVariant.price.amount),
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


/* 
  Product Page
*/
export default function Product() {
  const {product, shop, recommended} = useLoaderData();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;

  return (
      <div className="single-product">
        <div className="wrapper">

          {/* GALLERY */}
          <div className="gallery">
            <ProductGallery media={media.nodes} className="w-full lg:col-span-2" />
          </div>

          {/* INFO */}
          <div className="info">
            <div className="wrap">

              <div className="title desktop">
                <h1>{vendor} / {title}</h1> 
              </div>

              <ProductForm />

              <div className="pagination">
                <div>back to all</div>
                <div>next</div>
              </div>

            </div>
          </div>

        </div>
      </div>
  );
}

/* 
  ~ PRODUCT FORM ~
*/
export function ProductForm({
  optionName,
  optionValue,
  children,
  ...props
}) {
  const {product, analytics} = useLoaderData();

  const [currentSearchParams] = useSearchParams();
  const {location} = useNavigation();

  /**
   * We update `searchParams` with in-flight request data from `location` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return location ? new URLSearchParams(location.search) : currentSearchParams;
  }, [currentSearchParams, location]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const {name, value} of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics = {
    ...analytics.products[0],
    quantity: 1,
  };

  useEffect(() => {
    console.log(product);
  });

  const handleClick = () => {
    gsap.to('.variant-list', {
      opacity: 1,
      x: 0,
      duration: 0.32
    });
  }

  return (
    <div className="product-form">
      <div className="wrapper">

        {/* ACTIONS HEADER*/}
        {selectedVariant && (
          <div className="actions-header">

            {/* PRICE */}
            <div className="price">
              <Money
                withoutTrailingZeros
                data={selectedVariant?.price}
                as="span"
              />
              {isOnSale && (
                <Money
                  withoutTrailingZeros
                  data={selectedVariant?.compareAtPrice}
                  as="span"
                  className="opacity-50 strike"
                />
              )}
            </div>


            {/* SIZE or EMAIL */}
            {!isOutOfStock ? (
              <div className="size-holder">
                <details>
                  <summary onClick={handleClick}>
                      <div className="title">size</div>
                      <div className="icon">
                        <img src="/down-caret.svg" alt="View options" />
                      </div>
                  </summary>
                      
                  <div className="size-select-body">
                    {product.options.filter((option) => option.values.length > 1).map((option) => (
                      
                      option.name === 'Size' ? (
                        <ul className="variant-list" data-type={option.name} key={option.id}>
                          {option.values.map((value, x) => (
                              <li className="variant-link" key={x}>
                                <ProductOptionLink optionName={option.name} optionValue={value} searchParams={searchParamsWithDefaults} />  
                              </li>
                          ))}
                        </ul>
                      ) : (
                        <div></div>
                      )

                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="notify-me-later">
                <input type="email" placeholder="email" />
              </div>
            )}

            {/* BUTTON */}
            {!isOutOfStock ? (
              <div className="button">
                  <AddToCartButton
                    lines={[
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: 1,
                      },
                    ]}
                    variant="primary"
                    data-test="add-to-cart"
                    analytics={{
                      products: [productAnalytics],
                      totalValue: parseFloat(productAnalytics.price),
                    }}
                  >
                    <span>Add to Cart</span>
                  </AddToCartButton>
              </div>
            ) : (
              <button className="notify">SUBMIT</button>
            )}
          </div>
        )}

        {/* TITLE */}
        <div className="title mobile">
          <h1>{product.vendor} / {product.title}</h1> 
        </div>
        
        {/* DESCRIPTION */}
        <div className="description">
          <h3>about</h3>
          <div className="description-content">
            {product.description}
          </div>
        </div>

        {/* OPTIONS */}
        <div className="product-details">

          {/* COLOR */}
          <div className="colors">
            <details>

              <summary>colors</summary>

              <div className="details-body">
                {product.options.map((option, y) => (

                  option.name === 'Color' ? (
                    <ul className="list" data-type={option.name} key={y}>
                      {option.values.map((value, x) => (
                          <li className="variant-link" key={x}>
                            <ProductOptionLink optionName={option.name} optionValue={value} searchParams={searchParamsWithDefaults} />  
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ display: 'none' }}></div>
                  )

                ))}
              </div>
            </details>
          </div>
          
          {/* SIZE TABLE */}
          <div className="size-chart">
            <details>
              <summary>size chart</summary>

              <div className="details-body">

                {/* LABELS */}
                <div className="label-holder">
                  <div className="label">
                    label:
                  </div>
                  <div className="chest">
                    chest:
                  </div>
                  <div className="waist">
                    waist:
                  </div>
                  <div className="shoulder">
                    shoulder:
                  </div>
                </div>

                {/* DATA HOLDER */}
                <div className="data-holder">

                  {/* LABEL VALUES */}
                  <div className="data">
                    {product.options.filter((option) => option.values.length > 1).map((option, k) => (

                      option.name === 'Size' ? (
                        <ul className="list" data-type={option.name} key={k}>
                          {option.values.map((value, z) => (
                              <li key={z}>
                                {value}  
                              </li>
                          ))}
                        </ul>
                      ) : (
                        <div key={k}></div>
                      )

                    ))}
                  </div>

                  {/* CHEST VALUES */}
                  <div className="data chest">
                    chest values
                      
                    <ul>
                      {product.variants.nodes.map((node) => ( 

                        // if size is Small? then do for each size
                        //node.chestSize.value
                        // node.waistSize.value
                      
                      ))}
                    </ul>

                  </div>
                  
                  {/* WAIST VALUES */}
                  <div className="data">
                    waist size
                  </div>

                  {/* SHOULDER VALUES */}
                  <div className="data">
                    shoulder size
                  </div>

                </div>

              </div>

            </details>
          </div>

        </div>

      </div>
    </div>
  );
}

/*
  PRODUCT OPTIONS
*/
function ProductOptions({options, searchParamsWithDefaults}) {
  const closeRef = useRef(null);
  return (
    <div className="option-container">
      {options.filter((option) => option.values.length > 1).map((option) => (

          <div className="option-item" key={option.name}>

            {/* TITLE */}
            <div className="title">
              <h3>
                {option.name}
              </h3>
            </div>

            {/* OPTIONS */}
            <div className="options">
              {option.values.map((value) => {
                const checked = searchParamsWithDefaults.get(option.name) === value;
                const id = `option-${option.name}-${value}`;

                return (
                  <Text key={id}>
                    <ProductOptionLink optionName={option.name} optionValue={value} searchParams={searchParamsWithDefaults} className={checked ? 'active' : ''} />
                  </Text>
                );
              })}
            </div>

          </div>
        ))}
    </div>
  );
}

/*
  PRODUCT OPTION LINK
*/
function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}) {
  const {pathname} = useLocation();
  const isLocalePathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLocalePathname ? `/${pathname.split('/').slice(2).join('/')}` : pathname;
  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link {...props} preventScrollReset prefetch="intent" replace to={`${path}?${clonedSearchParams.toString()}`}>
      {children ?? optionValue}
    </Link>
  );
}

function ProductDetail({title, content, learnMore}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    displayColor: metafield(
          namespace: "merch"
          key: "displaycolor"
    ) {
      value
      namespace
      key
    }
    chestSize: metafield(
          namespace: "size"
          key: "chest"
    ) {
        value
        namespace
        key
    }
    waistSize: metafield(
          namespace: "size"
          key: "waist"
    ) {
        value
        namespace
        key
    }
    shoulderSize: metafield(
          namespace: "size"
          key: "shoulder"
    ) {
        value
        namespace
        key
    }
    product {
      title
      handle
      vendor
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 50) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
