export const formatCurrency = (
  amount: number,
  _currency: string = 'KES'
): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'KSh 0';
  }
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number
): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getOrderStatusColor = (
  status: string
): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const statusMap: Record<
    string,
    'primary' | 'success' | 'warning' | 'error' | 'info'
  > = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    PROCESSING: 'primary',
    SHIPPED: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'error',
    REFUNDED: 'info',
  };

  return statusMap[status] || 'info';
};

export const getPaymentStatusColor = (
  status: string
): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const statusMap: Record<
    string,
    'primary' | 'success' | 'warning' | 'error' | 'info'
  > = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'error',
    REFUNDED: 'info',
  };

  return statusMap[status] || 'info';
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const randomId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const DEFAULT_LAPTOP_IMAGE = '/laptops/hp-pavilion-natural.jpg';

export const getBrandNaturalImage = (nameOrBrand: string, index: number = 0): string => {
  const text = (nameOrBrand || '').toLowerCase();
  if (text.includes('apple') || text.includes('macbook')) {
    return index > 0 ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' : '/laptops/macbook-pro-natural.jpg';
  }
  if (text.includes('hp') || text.includes('pavilion') || text.includes('spectre') || text.includes('envy') || text.includes('omen')) {
    return index > 0 ? 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' : '/laptops/hp-pavilion-natural.jpg';
  }
  if (text.includes('lenovo') || text.includes('thinkpad') || text.includes('yoga') || text.includes('legion')) {
    return index > 0 ? 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800' : '/laptops/lenovo-thinkpad-natural.jpg';
  }
  if (text.includes('samsung') || text.includes('galaxy')) {
    return index > 0 ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800' : '/laptops/samsung-galaxybook-natural.jpg';
  }
  if (text.includes('asus') || text.includes('rog') || text.includes('zenbook') || text.includes('tuf')) {
    return index > 0 ? 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800' : '/laptops/asus-rog-natural.jpg';
  }
  if (text.includes('dell') || text.includes('xps') || text.includes('vostro') || text.includes('inspiron') || text.includes('alienware')) {
    return index > 0 ? '/laptops/dell-vostro-natural.png' : '/laptops/dell-xps-natural.jpg';
  }
  return index > 0 ? '/laptops/dell-xps-natural.jpg' : '/laptops/hp-pavilion-natural.jpg';
};

// Filter out known cyber neon / AI-rendered stock images
const isArtificialNeonUrl = (url: string): boolean => {
  if (!url) return true;
  return (
    url.includes('1531297484001') || // neon synthwave laptop
    url.includes('1550745165') ||    // retro neon pink arcade
    url.includes('1587202372')       // cyber neon keyboard
  );
};

export const getProductImage = (item: any, index: number = 0): string => {
  if (!item) return DEFAULT_LAPTOP_IMAGE;

  // Direct valid image string
  if (typeof item === 'string' && item.trim().length > 0 && !item.includes('[object Object]')) {
    if (!isArtificialNeonUrl(item)) return item;
  }

  // Nested in product property
  if (item.product) {
    return getProductImage(item.product, index);
  }

  const nameOrBrand =
    item.name ||
    item.brand?.name ||
    (typeof item.brand === 'string' ? item.brand : '') ||
    '';

  // Check images array
  if (Array.isArray(item.images) && item.images.length > 0) {
    const target = item.images[index] || item.images[0];
    const url = typeof target === 'string' ? target : target?.url;
    if (url && typeof url === 'string' && !url.includes('[object Object]') && !isArtificialNeonUrl(url)) {
      return url;
    }
  }

  // Check direct image or url property
  if (item.url && typeof item.url === 'string' && !isArtificialNeonUrl(item.url)) {
    return item.url;
  }
  if (item.image && typeof item.image === 'string' && !item.image.includes('[object Object]') && !isArtificialNeonUrl(item.image)) {
    return item.image;
  }

  // Brand-aware natural photography fallback
  return getBrandNaturalImage(nameOrBrand, index);
};

