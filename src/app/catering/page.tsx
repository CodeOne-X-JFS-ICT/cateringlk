import React from "react";

export default function CateringPage() {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-6 py-20 text-center bg-[#0a0806]">
      <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-3">
        Event & Corporate Packages
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-stone-100 mb-4">
        Catering Services
      </h1>
      <p className="max-w-xl text-stone-400 text-base">
        From grand weddings to corporate functions, we deliver exceptional catering tailored to your vision.
      </p>
    </div>
  );
}
