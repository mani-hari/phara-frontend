import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      {/* Main image */}
      {images[0] && (
        <Container className="relative aspect-[4/3] w-full overflow-hidden bg-warm-50 rounded-xl">
          {!!images[0].url && (
            <Image
              src={images[0].url}
              priority
              className="absolute inset-0 rounded-xl"
              alt="Product image"
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 600px"
              style={{ objectFit: "cover" }}
            />
          )}
        </Container>
      )}

      {/* Thumbnail grid for additional images */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {images.slice(1, 4).map((image, index) => (
            <Container
              key={image.id}
              className="relative aspect-square w-full overflow-hidden bg-warm-50 rounded-lg"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={false}
                  className="absolute inset-0 rounded-lg"
                  alt={`Product image ${index + 2}`}
                  fill
                  sizes="(max-width: 576px) 120px, 180px"
                  style={{ objectFit: "cover" }}
                />
              )}
            </Container>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
