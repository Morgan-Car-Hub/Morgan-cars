import { ArrowUpRight, Star, User } from 'lucide-react';
import {
  CAR_INVENTORY,
  CUSTOMER_TESTIMONIALS,
  type CarListing,
} from '../data/cars';

interface CustomerTestimonialsProps {
  onSelectCar: (car: CarListing) => void;
}

export function CustomerTestimonials({ onSelectCar }: CustomerTestimonialsProps) {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="border-b border-black/10 bg-[#F3F1EC] py-16 lg:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-black/10">
          <div>
            <p className="text-[13px] font-medium text-[#5C5E64] mb-2">
              Verified Deliveries · Brand New &amp; Used Buyers
            </p>
            <h2
              id="testimonials-heading"
              className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-[#141416]"
              style={{ textWrap: 'balance' }}
            >
              Customer Testimonials
            </h2>
          </div>

          <p className="text-sm text-[#5C5E64] max-w-md leading-relaxed">
            Feedback from buyers who inspected our inventory online, verified condition reports via WhatsApp and TikTok, and completed delivery through Morgan Car Hub.
          </p>
        </div>

        {/* 3-Column Testimonial Cards (Placeholder Names & Avatar Photo Frames) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {CUSTOMER_TESTIMONIALS.map((item) => {
            const linkedCar =
              CAR_INVENTORY.find((car) => car.id === item.carId) ?? CAR_INVENTORY[0];

            return (
              <article
                key={item.id}
                className="bg-white border border-black/10 rounded-xl p-6 flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  {/* Star Rating + Condition Metadata */}
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-1 text-[#C8321E]"
                      aria-label={`${item.rating} out of 5 stars`}
                    >
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <Star
                          key={`${item.id}-star-${idx}`}
                          className="w-4 h-4 fill-[#C8321E]"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-[#5C5E64]">
                      {item.conditionType} Purchase
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm text-[#2E3035] leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Placeholder Customer Avatar & Attribution */}
                <div className="pt-4 border-t border-black/8 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full bg-[#ECEAE4] border border-black/10 flex items-center justify-center text-[#5C5E64] shrink-0"
                      role="img"
                      aria-label={`Photo placeholder for ${item.customerName}`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#141416] truncate">
                        {item.customerName}
                      </p>
                      <p className="text-xs text-[#5C5E64] truncate">
                        {item.buyerRole} · {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#5C5E64] truncate">{item.purchasedCar}</span>
                    <button
                      type="button"
                      onClick={() => onSelectCar(linkedCar)}
                      className="inline-flex items-center gap-1 font-semibold text-[#141416] hover:text-[#C8321E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      View Model
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
