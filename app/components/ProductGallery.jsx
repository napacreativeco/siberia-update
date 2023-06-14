import {Image} from '@shopify/hydrogen';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({media, className}) {
  if (!media.length) {
    return null;
  }

  return (
    <div>
      {media.map((med, i) => {
        const isFirst = i === 0;
        const isFourth = i === 3;
        const isFullWidth = i % 3 === 0;

        const data = {
          ...med,
          image: {
            // @ts-ignore
            ...med.image,
            altText: med.alt || 'Product image',
          },
        };

        return (
          <div style={{ width: '100%' }}
            // @ts-ignore
            key={med.id || med.image.id}
          >
            {med.image && (
              <Image
                loading={i === 0 ? 'eager' : 'lazy'}
                data={data.image}
                aspectRatio={!isFirst && !isFourth ? '4/5' : undefined}
                sizes={
                  isFirst || isFourth
                    ? '(min-width: 100em) 60vw, 90vw'
                    : '(min-width: 100em) 30vw, 90vw'
                }
                className="fadeIn"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
