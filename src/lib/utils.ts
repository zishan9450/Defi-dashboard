import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PoolCategory } from "@/types"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColor(category: PoolCategory): string {
  switch (category) {
    case 'Lending':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'Liquid Staking':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'Yield Aggregator':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
}

export function getProjectIcon(project: string): React.ReactElement {
  const initials = project
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return React.createElement('div', {
    className: "w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center"
  }, React.createElement('span', {
    className: "text-sm font-bold text-primary"
  }, initials));
}
