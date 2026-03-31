import { generateProductReviews } from "@lib/data/reviews"
import { Star, Quote } from "lucide-react"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-brand-500 text-brand-500"
              : "fill-grey-10 text-grey-10"
          }`}
        />
      ))}
    </div>
  )
}

type ProductReviewsProps = {
  productTitle: string
}

export default function ProductReviews({ productTitle }: ProductReviewsProps) {
  const reviews = generateProductReviews(productTitle, 3)
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <section className="py-12 sm:py-16 bg-grey-5">
      <div className="content-container">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-grey-90">
            Devotee Reviews
          </h2>
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-grey-50">
              {avgRating.toFixed(1)} / 5
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 border border-grey-10"
            >
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm text-grey-60 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold text-grey-90">
                    {review.name}
                  </p>
                  <p className="text-xs text-grey-50">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
