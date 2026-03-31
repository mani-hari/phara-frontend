import { getHomepageTestimonials, Review } from "@lib/data/reviews"
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

export default function Testimonials() {
  const reviews = getHomepageTestimonials()

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="content-container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-grey-90">
            What Devotees Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-grey-5 rounded-2xl p-6 border border-grey-10 flex flex-col"
            >
              <StarRating rating={review.rating} />
              <p className="mt-4 text-sm text-grey-60 leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-grey-10">
                <p className="text-sm font-semibold text-grey-90">
                  {review.name}
                </p>
                <p className="text-xs text-grey-50">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
