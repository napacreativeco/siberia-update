import clsx from 'clsx';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';

import {Text, Link, AddToCartButton} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function ProductCard({
  product,
  vendor,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}) {
  let cardLabel;

  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price, compareAtPrice)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    vendor: product.vendor,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="product-card">
      <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
        <article>
            {/* PRODUCT IMAGE */}
            <div className="card-image aspect-[4/5] bg-primary/5">
              {image && (
                <Image
                  className="object-cover w-full fadeIn"
                  sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                  aspectRatio="4/5"
                  data={image}
                  alt={image.altText || `Picture of ${product.title}`}
                  loading={loading}
                />
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="product-info">

              {/* SALES INDICATOR */}
              <div className="sale-indicator">
                {cardLabel ? (
                  <span>
                    {cardLabel}
                  </span>  
                ) : (
                  <div></div>
                )}
              </div> 

              {/* TAG */}
              <div className="product-tag">
                <h3>
                  {product.vendor}
                </h3>
              </div>    


              {/* TITLE */}
              <div className="product-title">
                <h3>
                  {product.title}
                </h3>
              </div>  


              {/* PRICE */}
              <div className="price">
                <span>
                  <Money withoutTrailingZeros data={price} />
                  {isDiscounted(price, compareAtPrice) && (
                    <CompareAtPrice
                      className={'opacity-50'}
                      data={compareAtPrice}
                    />
                  )}
                </span>
              </div>

            </div>
        </article>
      </Link>

      {quickAdd && (

        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
        >

          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Cart
          </Text>

        </AddToCartButton>
      )}
    </div>
  );
}

function CompareAtPrice({data, className}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
