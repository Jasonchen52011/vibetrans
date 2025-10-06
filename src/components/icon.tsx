'use client';

import {
  ArrowRight,
  ArrowUp,
  Brain,
  ChartLine,
  Cog,
  Headset,
  Heart,
  Pause,
  Play,
  Rocket,
  Shield,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FaRocket: Rocket,
  FaShieldAlt: Shield,
  FaUsers: Users,
  FaChartLine: ChartLine,
  FaCog: Cog,
  FaHeadset: Headset,
  FaArrowUp: ArrowUp,
  FaArrowRight: ArrowRight,
  FaBrain: Brain,
  FaHeart: Heart,
  FaPlay: Play,
  FaPause: Pause,
};

interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return <IconComponent className={className} />;
}
