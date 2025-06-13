'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/Dialog';
import { Tool } from '@/constants/tools';
import React from 'react';

interface ToolModalProps {
  tool: Tool;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

export function ToolModal({ tool, isOpen, onOpenChange, children }: ToolModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl bg-neutral-800 border-neutral-700 text-neutral-100">
        <DialogHeader>
          <div className="flex items-center mb-2">
            <tool.icon className="h-6 w-6 text-sky-400 mr-3" />
            <DialogTitle className="text-neutral-100">{tool.name}</DialogTitle>
          </div>
          <DialogDescription className="text-neutral-400 text-left">
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 min-h-[200px] bg-neutral-850 p-4 rounded-md border border-neutral-700">
          <p className="text-neutral-500 text-center">
            工具交互界面区域 (例如: 输入框, 输出结果等)
          </p>
        </div>

        <DialogFooter className="border-t border-neutral-700 pt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button>
            执行优化
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
