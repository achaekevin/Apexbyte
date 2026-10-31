import api from './api';

export interface PublicSettings {
  // General Store Identity
  store_name: string;
  store_tagline: string;
  store_description: string;

  // Showroom & Contact
  showroom_address: string;
  showroom_city: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp_number: string;
  support_email: string;
  hours_weekdays: string;
  hours_saturday: string;
  hours_sunday: string;

  // Announcement Bar
  announcement_enabled: boolean;
  announcement_badge: string;
  announcement_text: string;
  announcement_link: string;

  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_cta_primary_text: string;
  hero_cta_primary_link: string;
  hero_cta_secondary_text: string;
  hero_cta_secondary_link: string;

  // Commerce & Shipping Rules
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate_percent: number;
  currency_code: string;
  currency_symbol: string;

  // Trust Badges
  badge_warranty: string;
  badge_delivery: string;
  badge_returns: string;
  badge_pickup: string;

  // Social
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_tiktok: string;

  [key: string]: any;
}

export interface SettingDefinition {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: 'general' | 'contact' | 'announcement' | 'hero' | 'commerce' | 'badges' | 'social';
  isPublic: boolean;
  label: string;
  description?: string;
}

export const settingService = {
  getPublicSettings: async (): Promise<PublicSettings> => {
    const res: any = await api.get('/settings/public');
    return res.data || res;
  },

  getAllSettingsAdmin: async (): Promise<{
    settings: Record<string, any>;
    definitions: SettingDefinition[];
  }> => {
    const res: any = await api.get('/settings');
    return res.data || res;
  },

  updateSettings: async (updates: Record<string, any>): Promise<any> => {
    const res: any = await api.put('/settings', updates);
    return res.data || res;
  },
};

export default settingService;

