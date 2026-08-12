import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-6 py-20 text-center bg-gradient-to-b from-[#0f0b09] via-[#140f0c] to-[#0a0806]">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold mb-8">
        <span>👑</span>
        <span>Colombo & Western Province&apos;s Finest Dining & Catering</span>
      </div>

      {/* Hero Title */}
      <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
        Exquisite Fine Dining & <br />
        <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
          Bespoke Catering Experience
        </span>
      </h1>

      {/* Hero Description */}
      <p className="max-w-2xl text-stone-400 text-base sm:text-lg mb-10 leading-relaxed font-light">
        Ahas Gawwa brings world-class culinary artistry, luxury event catering,
        and authentic Sri Lankan flavors straight to your special occasions.
      </p>

      {/* Hero Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/contact"
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-orange-950/50 transition-all hover:scale-105 active:scale-95"
        >
          Get Instant Quote
        </Link>
        <Link
          href="/restaurant"
          className="px-8 py-3.5 rounded-xl border border-stone-700 bg-stone-900/60 hover:bg-stone-800 text-stone-200 font-semibold text-sm transition-all"
        >
          Explore Restaurant Menu
        </Link>
      </div>
    </div>
  );
}
