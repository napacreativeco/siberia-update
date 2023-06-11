import clsx from 'clsx';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';

import {Text, Link, AddToCartButton} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export default function ProductList({
    product,
    label,
    className,
    loading,
    onClick,
    quickAdd,
  }) {

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
    
    return (
        <section className="product-list">
            <div className="wrapper">
                <table>
                    <tbody>
                        <tr>
                            {/* IMAGE */}
                            <td className="image">
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
                            </td>

                            {/* TITLE */}
                            <td><h2>{product.title}</h2></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
}