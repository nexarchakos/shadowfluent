import { useState } from 'react';
import { Category } from '../types';
import { getSEOContent } from '../utils/seoContent';

interface SEOFooterProps {
  category: Category | null;
}

export default function SEOFooter({ category }: SEOFooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const seoContent = getSEOContent(category);

  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div
          className={`seo-content ${isExpanded ? 'expanded' : ''}`}
        >
          {seoContent.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {section.heading && (
                <h2 className="text-white font-bold text-lg md:text-xl mb-3">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((paragraph, paraIndex) => (
                <p key={paraIndex} className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors flex items-center gap-2"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Show less content' : 'Show more content'}
        >
          {isExpanded ? (
            <>
              <span>View Less</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>View More</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
