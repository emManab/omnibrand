import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { heroOffers } from "@/data/mediaAssets";
import { MediaDisplay } from "@/components/MediaDisplay";
import { toast } from "sonner";

export function OfferHeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const offer = heroOffers[currentIndex];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroOffers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroOffers.length) % heroOffers.length);
  };

  return (
    <div className="w-full">
      {/* Vistaprint-Style Top Announcement Banner */}
      <div className="bg-[#111827] text-white py-2 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
        <span>Festival Savings: Flat ₹300 off ₹2,499+ or ₹150 off ₹1,499+</span>
        <span className="hidden sm:inline">|</span>
        <button
          onClick={() => handleCopyCode(offer.code)}
          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded transition text-xs font-semibold cursor-pointer"
          title="Click to copy code"
        >
          <span>Code: {offer.code}</span>
          {copiedCode === offer.code ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
        <span className="hidden sm:inline">|</span>
        <span className="text-white/80">{offer.validUntil}</span>
        <Link to="/catalog" className="inline-flex items-center text-white/90 hover:text-white ml-1 font-bold">
          ›
        </Link>
      </div>

      {/* Main Festive Hero Banner */}
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-7">
        <div
          className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r ${offer.gradient} shadow-lg transition-colors duration-700 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center justify-center p-4 sm:p-8 md:p-12`}
        >
          {/* Optional Ambient Background Video if provided by user */}
          {offer.videoSrc && (
            <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay">
              <MediaDisplay
                src=""
                videoSrc={offer.videoSrc}
                className="w-full h-full"
                autoPlay
                loop
                muted
              />
            </div>
          )}

          {/* Watermark Pattern Background (Left & Right) */}
          <div className="absolute inset-0 flex justify-between pointer-events-none select-none overflow-hidden opacity-15">
            <div className="flex flex-col gap-2 -ml-6 -mt-4 text-black text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest whitespace-nowrap">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={`l-${i}`}>{offer.watermarkText}</span>
              ))}
            </div>
            <div className="flex flex-col gap-2 -mr-6 -mt-4 text-black text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest whitespace-nowrap text-right">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={`r-${i}`}>{offer.watermarkText}</span>
              ))}
            </div>
          </div>

          {/* Center Elevated Offer Card */}
          <div className="relative z-10 w-full max-w-2xl bg-[#faf9f4] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/60 backdrop-blur-sm transition-all duration-300">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-800 uppercase mb-2 sm:mb-3">
              {offer.eyebrow}
            </p>

            {/* Headline */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-950 leading-[1.18] sm:leading-[1.15] mb-3">
              {offer.headline}
            </h1>

            {/* Validity & Code badge */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 mb-6">
              <span>{offer.validUntil}</span>
              <span>|</span>
              <button
                onClick={() => handleCopyCode(offer.code)}
                className="inline-flex items-center gap-1.5 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-900 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
              >
                <span>Code: {offer.code}</span>
                {copiedCode === offer.code ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            {/* Category Button Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
              {offer.ctas.map((cta, i) => (
                <Link
                  key={cta.label}
                  to={cta.to}
                  className={
                    cta.primary || i === 0
                      ? "inline-flex items-center justify-center rounded-lg bg-black px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 hover:shadow active:scale-95"
                      : "inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-95"
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>

            {/* Bottom Subtitle */}
            <p className="text-[11px] sm:text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed">
              {offer.footerText}
            </p>
          </div>

          {/* Left Arrow */}
          <button
            type="button"
            aria-label="Previous offer"
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/95 text-neutral-800 shadow-lg transition hover:scale-110 hover:bg-white cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            aria-label="Next offer"
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/95 text-neutral-800 shadow-lg transition hover:scale-110 hover:bg-white cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center justify-center gap-2 py-3" aria-label="Offer slides">
          {heroOffers.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show offer ${index + 1}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === index ? "w-6 bg-[#111827]" : "w-2.5 bg-[#d5dce8] hover:bg-[#91a3bd]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
