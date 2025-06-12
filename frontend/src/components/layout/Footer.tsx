import { Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = 'https://github.com/AlbertHuangKSFO/workplace-optimizer';

  return (
    <footer className="py-4 px-6 text-center text-xs text-gray-500 border-t border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <p>
          &copy; {currentYear} Powered by 二黄 Albert Huang.
        </p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-gray-400 transition-colors"
        >
          <Github size={16} className="mr-1" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
