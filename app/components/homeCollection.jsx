import { useState } from 'react';
import {ProductCard} from '~/components';
import ProductListItem from '~/components/ProductListItem';
import {Link} from '~/components/Link';

const mockProducts = new Array(16).fill('');

export default function HomeCollection({
  title = 'Home Collection',
  products = mockProducts,
  count = 16,
  ...props
}) {

  const [isList, setIsList] = useState(false);

  const handleClick = () => {
    if (isList === true ) { 
        setIsList(false);
    } else { 
        setIsList(true);
    }
  }

  return (
    <section className="home-collection page-component shop" heading={title} {...props}>

      {/* Grid Changer */}
      <div className="grid-changer">

        {/* Cross Hair */}
        <div className="crosshair" onClick={handleClick}>
            <img style={{ transform: isList ? 'rotate(90deg)' : 'rotate(0deg)' }} src="/crosshair.svg" alt="Grid View"/>
        </div>

        {/* Pagination */}
        <div className="pagination">
            01 - <Link to="/collections/all/">all</Link>
        </div>

      </div>

      {/* GRID */}
      {isList === false &&
        <div className="grid-view">
          {products.map((product) => (
            <ProductCard
              product={product}
              key={product.id}
            />
          ))}
        </div>
      }

      {/* LIST */}
      {isList === true &&
        <div className="list-view">
          <ul>
            {products.map((product) => (
              <ProductListItem product={product} key={product.id} />
            ))}
          </ul>
        </div>
      }

    </section>
  );
}
