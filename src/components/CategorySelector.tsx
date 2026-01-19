import { Link, useLocation } from 'react-router-dom';
import { Category } from '../types';
import { categoryToUrlSlug } from '../utils/urlMapping';
import { 
  Briefcase, 
  Plane, 
  Trophy, 
  Users, 
  MessageCircle, 
  BriefcaseIcon, 
  GraduationCap, 
  Heart, 
  UtensilsCrossed, 
  ShoppingBag, 
  Laptop, 
  Share2, 
  HelpCircle, 
  UsersRound, 
  AlertTriangle, 
  BookOpen, 
  Film, 
  Dumbbell 
} from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: Category | null;
  onSelectCategory?: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'business', label: 'Business English', icon: <Briefcase className="w-6 h-6" /> },
  { id: 'questions', label: 'Questions', icon: <HelpCircle className="w-6 h-6" /> },
  { id: 'travel', label: 'Travel', icon: <Plane className="w-6 h-6" /> },
  { id: 'sport', label: 'Sport', icon: <Trophy className="w-6 h-6" /> },
  { id: 'meetings', label: 'Meetings', icon: <Users className="w-6 h-6" /> },
  { id: 'daily-conversation', label: 'Daily Conversation', icon: <MessageCircle className="w-6 h-6" /> },
  { id: 'job-interview', label: 'Job Interview', icon: <BriefcaseIcon className="w-6 h-6" /> },
  { id: 'academic', label: 'Academic', icon: <GraduationCap className="w-6 h-6" /> },
  { id: 'medical', label: 'Medical', icon: <Heart className="w-6 h-6" /> },
  { id: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed className="w-6 h-6" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="w-6 h-6" /> },
  { id: 'technology', label: 'Technology', icon: <Laptop className="w-6 h-6" /> },
  { id: 'social-media', label: 'Social Media', icon: <Share2 className="w-6 h-6" /> },
  { id: 'family', label: 'Family', icon: <UsersRound className="w-6 h-6" /> },
  { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-6 h-6" /> },
  { id: 'education', label: 'Education', icon: <BookOpen className="w-6 h-6" /> },
  { id: 'entertainment', label: 'Entertainment', icon: <Film className="w-6 h-6" /> },
  { id: 'health-fitness', label: 'Health & Fitness', icon: <Dumbbell className="w-6 h-6" /> },
];

export default function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const location = useLocation();
  const activeCategory = selectedCategory;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const urlSlug = categoryToUrlSlug(category.id);
        return (
          <Link
            key={category.id}
            to={`/${urlSlug}`}
            className={`
              p-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 block
              ${isActive
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl ring-2 ring-primary-300 ring-offset-2'
                : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 shadow-md hover:shadow-lg'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={isActive ? 'scale-110' : ''}>
                {category.icon}
              </div>
              <span className="font-semibold text-sm">{category.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
