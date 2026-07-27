'use client';

import { ArrowRight } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  image?: boolean;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Connect your accounts',
    description: 'Link your bank accounts, credit cards, and payment processors. We support 10,000+ integrations worldwide. Your data is encrypted end-to-end.',
    image: true,
  },
  {
    number: 2,
    title: 'Auto-categorize transactions',
    description: 'Our AI learns your spending patterns and automatically categorizes transactions. You can customize rules anytime or manually adjust categories.',
    image: true,
  },
  {
    number: 3,
    title: 'Generate reports instantly',
    description: 'Create tax-ready financial statements, profit/loss reports, and cash flow analysis in seconds. Export to PDF, CSV, or send directly to your accountant.',
    image: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How it works in three steps
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get started in minutes and see results immediately
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Content */}
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <a href="#" className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-semibold hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight size={18} />
                  </a>
                )}
              </div>

              {/* Image/Mockup Placeholder */}
              <div className="flex-1">
                <div className="w-full aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📱</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Step {step.number} Preview</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
