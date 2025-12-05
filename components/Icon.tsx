import React from 'react';
import {
  // Layout & Navigation
  Layout,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,

  // Actions
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Save,
  Download,
  Upload,
  Share2,
  ExternalLink,
  RefreshCw,

  // Content
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Tag,
  Hash,
  Star,
  Heart,
  Pin,
  Bookmark,

  // AI & Magic
  Wand2,
  Sparkles,
  Zap,
  Bot,

  // UI Elements
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,

  // Text & Editor
  Type,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,

  // Misc
  Clock,
  Calendar,
  Command,
  Keyboard,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Grip,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  History,
  Archive,
  Inbox,
  Send,
  MessageSquare,
  Terminal,

  // Lucide Props Type
  LucideProps,
} from 'lucide-react';

// Re-export all icons with proper types
export const Icons = {
  // Layout & Navigation
  Layout,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,

  // Actions
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Save,
  Download,
  Upload,
  Share2,
  ExternalLink,
  RefreshCw,

  // Content
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Tag,
  Hash,
  Star,
  Heart,
  Pin,
  Bookmark,

  // AI & Magic
  Wand2,
  Sparkles,
  Zap,
  Bot,

  // UI Elements
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,

  // Text & Editor
  Type,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,

  // Misc
  Clock,
  Calendar,
  Command,
  Keyboard,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Grip,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  History,
  Archive,
  Inbox,
  Send,
  MessageSquare,
  Terminal,
} as const;

// Icon component with default styling
interface IconProps extends LucideProps {
  icon: keyof typeof Icons;
}

export const Icon: React.FC<IconProps> = ({ icon, size = 20, ...props }) => {
  const IconComponent = Icons[icon];
  return <IconComponent size={size} {...props} />;
};

// Animated icon wrapper
interface AnimatedIconProps extends IconProps {
  animate?: 'spin' | 'pulse' | 'bounce';
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  animate,
  className = '',
  ...props
}) => {
  const animationClass = animate ? `animate-${animate}` : '';
  return <Icon {...props} className={`${className} ${animationClass}`} />;
};
