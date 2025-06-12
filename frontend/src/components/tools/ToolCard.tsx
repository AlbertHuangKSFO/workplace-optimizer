'use client';

import { Tool } from '@/constants/tools';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const IconComponent = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden shadow-lg",
        "bg-gradient-to-br from-neutral-700 to-neutral-800 hover:from-neutral-600 hover:to-neutral-700", // Using standard Tailwind colors
        "border border-neutral-700 hover:border-sky-600 transition-all duration-300",
        className
      )}
    >
      <Link href={tool.href} className="flex flex-col h-full p-5">
        <div className="flex items-center mb-3">
          <div className="p-2.5 bg-neutral-700 group-hover:bg-sky-600 rounded-lg mr-4 transition-colors duration-300">
            <IconComponent className="h-6 w-6 text-sky-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-sky-300 transition-colors duration-300">
              {tool.name}
            </h3>
            <p className="text-xs text-neutral-400">{tool.categoryName}</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 flex-grow mb-4 line-clamp-3 group-hover:text-neutral-200 transition-colors duration-300">
          {tool.description}
        </p>
        <div className="mt-auto flex justify-end items-center">
          <span className="text-xs font-medium text-sky-500 group-hover:text-sky-400 transition-colors duration-300">
            开始使用
          </span>
          <ArrowRight className="ml-1.5 h-4 w-4 text-sky-500 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}
