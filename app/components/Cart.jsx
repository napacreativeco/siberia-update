import {useRef} from 'react';
import clsx from 'clsx';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import {useFetcher} from '@remix-run/react';
import {
  Button,
  Heading,
  IconRemove,
  Text,
  Link,
  FeaturedProducts,
} from '~/components';

import {getInputStyleClasses} from '~/lib/utils';
import {CartAction} from '~/lib/type';

export function Cart({layout, onClose, cart}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
      <CartCheckoutActions className="checkout-options" checkoutUrl={cart} />
    </>
  );
}

/*
  CART DETAILS
*/
export function CartDetails({layout, cart}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  return (
    <div>
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions className="checkout-options" checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({discountCodes}) {
  const codes = discountCodes?.map(({code}) => code).join(', ') || null;

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes}</Text>
          </div>
        </div>
      </dl>

      {/* No discounts, show an input to apply a discount */}
      <UpdateDiscountForm>
        <div
          className={clsx(
            codes ? 'hidden' : 'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex justify-end font-medium whitespace-nowrap">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({children}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.UPDATE_DISCOUNT}
      />
      {children}
    </fetcher.Form>
  );
}

/*
  CART LINES
*/
function CartLines({layout = 'drawer', lines: cartLines}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  return (
    <section ref={scrollRef} aria-labelledby="cart-contents">
      <ul className="cart-items">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>
    </section>
  );
}

/*
  CHECKOUT ACTIONS
*/
function CartCheckoutActions({ cart }) {
  if (!checkoutUrl) return null;

  return (
    <div className="checkout-button-container">
      <a className="checkout-button" target="_self">
        <span>
          Checkout
        </span>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

/*
  CART SUMMARY
*/
function CartSummary({cost, layout, children = null}) {

  return (
    <section aria-labelledby="summary-heading" className="subtotal-container">
        <div className="wrapper">
            <div className="subtotal">
                <span>Subtotal</span>
            </div>
            <div className="amount">
                <span>
                  {cost?.subtotalAmount?.amount ? (
                    <Money data={cost?.subtotalAmount} />
                  ) : (
                    '-'
                  )}
                </span>
            </div>
        </div>
      {/* {children} */}
    </section>
  );
}

/* 
  LINE ITEM
*/
function CartLineItem({line}) {
  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;
  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li key={id} className="line-item">

        {/* DESKTOP */}
        <div className="item-wrapper desktop">

            {/* IMAGE */}
            <div className="image">
                {merchandise.image && (
                <Image
                    width={110}
                    height={110}
                    data={merchandise.image}
                    className="object-cover object-center w-24 h-24 md:w-28 md:h-28"
                    alt={merchandise.title}
                />
                )}
            </div>

            {/* VARIANT */}
            <div className="vendor">
                {merchandise.product.vendor}
            </div>

            {/* TITLE */}
            <div className="title">
                <Link to={`/products/${merchandise.product.handle}`}>
                    {merchandise?.product?.title || ''}
                </Link>
            </div>

            {/* QUANTITY */}
            <div className="quantity">
                <CartLineQuantityAdjust line={line} />
            </div>

            {/* SIZE */}
            <div className="size">
                {merchandise.selectedOptions[1].value}
            </div>

            {/* COLOR */}
            <div className="color">
                <div className="swatch" style={{ backgroundColor: merchandise.displayColor.value }}>
                </div>
            </div>

            {/* EDIT */}
            <div className="edit">
                Edit
            </div>

            {/* REMOVE */}
            <div className="delete">
                <ItemRemoveButton lineIds={[id]} />
            </div>

        </div>

        {/* MOBILE */}
        <div className="item-wrapper mobile">

          {/* IMAGE */}
          <div className="image">
              {merchandise.image && (
              <Image
                  width={110}
                  height={110}
                  data={merchandise.image}
                  className="object-cover object-center w-24 h-24 md:w-28 md:h-28"
                  alt={merchandise.title}
              />
              )}
          </div>

          {/* DATA */}
          <div className="data">

            {/* TITLE */}
            <div className="title">
                <Link to={`/products/${merchandise.product.handle}`}>
                  {merchandise.product.vendor} / {merchandise?.product?.title || ''}
                </Link>
            </div>

            {/* SIZE */}
            <div className="size">
                <span className="mobile">Size: {merchandise.selectedOptions[1].value}</span>
            </div>

            {/* COLOR */}
            <div className="color">
                <span className="mobile">Color: {merchandise.selectedOptions[0].value}</span>
            </div>

            {/* QUANTITY */}
            <div className="quantity">
                <span className="mobile">Quantity: </span><CartLineQuantityAdjust line={line} />
            </div>

          </div>

          {/* ACTIONS */}
          <div className="actions">
            {/* EDIT */}
            <div className="edit">
                <Link href="/cart">Edit</Link>
            </div>

            {/* REMOVE */}
            <div className="delete">
                <ItemRemoveButton lineIds={[id]} />
            </div>
          </div>

        </div>

    </li>
  );
}

/* DELETE */
function ItemRemoveButton({lineIds}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="cartAction" value={CartAction.REMOVE_FROM_CART} />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} />

      <button type="submit">
        <span>Delete</span>
      </button>

    </fetcher.Form>
  );
  
}

/* 
  QUANTITY INPUT
*/
function CartLineQuantityAdjust({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="quantity-container">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            className="decrease"
            name="decrease-quantity"
            aria-label="Decrease quantity"
            value={prevQuantity}
            disabled={quantity <= 1}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div className="quantity-input" data-test="item-quantity">
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="increase"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

/*
  UPDATE CART
*/
function UpdateCartButton({children, lines}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="cartAction" value={CartAction.UPDATE_CART} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      {children}
    </fetcher.Form>
  );
}

/*
  CART LINE
*/
function CartLinePrice({line, priceType = 'regular', ...passthroughProps}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

/* 
  EMPTY CART
*/
export function CartEmpty({hidden = false, layout = 'drawer', onClose}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  return (
    <div className="empty-cart" ref={scrollRef} hidden={hidden}>
      <section className="grid gap-6 cart-wrapper">

        <div className="text-holder">
            <Text format>
            Your cart is empty
            </Text>
        </div>

        <div className="underscore"></div>

        <div className="button-holder">
          <Button onClick={onClose}>Continue shopping</Button>
        </div>

      </section>
    </div>
  );
}

