/**
 * Sparse icon map — add an entry here when a tool uses a new Lucide icon.
 * Keeps the bundle from importing the entire lucide-vue-next library.
 */
import {
  AlignLeft,
  Binary,
  Braces,
  Clock,
  Copy,
  Cpu,
  Download,
  Fingerprint,
  Globe,
  Hash,
  ImageUp,
  KeyRound,
  Menu,
  Moon,
  QrCode,
  Search,
  ShieldCheck,
  Sun,
  Type,
  Wrench,
  X,
} from 'lucide-vue-next'

export { Menu, Moon, Sun }

const iconMap = {
  AlignLeft,
  Binary,
  Braces,
  Clock,
  Copy,
  Cpu,
  Download,
  Fingerprint,
  Globe,
  Hash,
  ImageUp,
  KeyRound,
  Menu,
  Moon,
  QrCode,
  Search,
  ShieldCheck,
  Sun,
  Type,
  Wrench,
  X,
}

/** Returns the Lucide component for `name`, falling back to Wrench. */
export function getIcon(name) {
  return iconMap[name] ?? Wrench
}
