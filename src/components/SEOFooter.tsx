import { Category } from '../types';
import { getSEOContent } from '../utils/seoContent';

interface SEOFooterProps {
  category: Category | null;
}

export default function SEOFooter({ category }: SEOFooterProps) {
  const seoContent = getSEOContent(category);

  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="seo-content expanded">
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
      </div>
    </footer>
  );
}
