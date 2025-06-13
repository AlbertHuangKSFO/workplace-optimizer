import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = 'https://github.com/AlbertHuangKSFO/workplace-optimizer';

  return (
    <footer className={cn(
      "py-4 px-6 text-center text-xs border-t",
      "text-neutral-600 dark:text-neutral-400",
      "border-neutral-200 dark:border-neutral-700"
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <p>
          &copy; {currentYear} Powered by 二黄 Albert Huang.
        </p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center transition-colors",
            "hover:text-neutral-800 dark:hover:text-neutral-200"
          )}
        >
          <Github size={16} className="mr-1" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
