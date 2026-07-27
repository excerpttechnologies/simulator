'use client';

import { ArrowRight } from 'lucide-react';

export function FooterCTA() {
  return (
    <section className="bg-gray-900 dark:bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Ready to transform your accounting?
        </h2>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join 2,000+ teams that are streamlining their accounting with Accountin. Start your free trial today.
        </p>

        {/* CTA Button */}
        <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-semibold transition-colors text-lg">
          Get started free
          <ArrowRight size={20} />
        </button>

        {/* Sub-text */}
        <p className="mt-6 text-sm text-gray-400">
          No credit card required. 14-day free trial.
        </p>
      </div>
    </section>
  );
}
