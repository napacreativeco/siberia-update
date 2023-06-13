import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import {useEffect} from 'react';

import {Text, Link, AddToCartButton} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export default function ProductListItem({
    product,
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

    useEffect(() => {
        console.log(product)
    })

    return (        
        <li>
            {/* DESKTOP */}
            <div className="desktop">

                {/* IMAGE */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="image">
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
                </Link>

                {/* VENDOR */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="vendor">
                        {product.vendor}
                    </div>
                </Link>

                {/* TITLE */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="title">
                        <h2>{product.title}</h2>
                    </div>
                </Link>

                {/* PRICE */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">                  
                    <div className="price">
                        <span>
                            <Money withoutTrailingZeros data={price} />
                            {isDiscounted(price, compareAtPrice) && (
                                <CompareAtPrice className={'opacity-50'} data={compareAtPrice} />
                            )}
                        </span>
                    </div>
                </Link>

                {/* SALES INDICATOR */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="sale-indicator">
                        {cardLabel ? (
                            <span>
                                {cardLabel}
                            </span>  
                        ) : (
                            <div></div>
                        )}
                    </div> 
                </Link>

                {/* COLOR */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="color">
                        color
                    </div>
                </Link>

            </div>

            {/* MOBILE */}
            <div className="mobile">

                {/* IMAGE */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="image">
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
                </Link>

                {/* INFO */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="info">

                        {/* VENDOR */}
                        <div className="vendor">
                            <h2>{product.vendor}</h2>
                        </div>

                        {/* TITLE */}
                        <div className="title">
                            <h2>{product.title}</h2>
                        </div>

                        {/* PRICE */}
                        <div className="price">
                            <span>
                                <Money withoutTrailingZeros data={price} />
                                {isDiscounted(price, compareAtPrice) && (
                                    <CompareAtPrice className={'opacity-50'} data={compareAtPrice} />
                                )}
                            </span>
                        </div>   

                    </div>
                </Link>
                
                {/* SALES INDICATOR */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">   
                    <div className="sale-indicator">
                        {cardLabel ? (
                            <span>
                                {cardLabel}
                            </span>  
                        ) : (
                            <span></span>
                        )}
                    </div> 
                </Link>

                {/* COLOR */}
                <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="intent">
                    <div className="color">
                        color
                    </div> 
                </Link>

            </div>

        </li>
    )
}