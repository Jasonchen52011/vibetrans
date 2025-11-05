'use client';

import {
  ArrowRight,
  ArrowUp,
  Brain,
  ChartLine,
  CheckCircle,
  Cog,
  Download,
  Eye,
  FileText,
  FileUp,
  Globe,
  Headset,
  Heart,
  Languages,
  Laugh,
  Palette,
  Pause,
  Pencil,
  Play,
  Rocket,
  Share2,
  Shield,
  Shuffle,
  Sparkles,
  Users,
  Volume2,
  Zap,
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
  FaPencilAlt: Pencil,
  FaLanguage: Languages,
  FaVolumeUp: Volume2,
  FaFileUpload: FileUp,
  FaDownload: Download,
  FaCheckCircle: CheckCircle,
  FaGlobe: Globe,
  FaFileAlt: FileText,
  FaLaughBeam: Laugh,
  FaRandom: Shuffle,
  FaPalette: Palette,
  FaMagic: Sparkles,
  FaShare: Share2,
  FaBolt: Zap,
  FaKeyboard: FileText,
  FaEye: Eye,
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
