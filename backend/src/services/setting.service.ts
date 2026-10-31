import prisma from '../config/database';

export interface SettingDefinition {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: 'general' | 'contact' | 'announcement' | 'hero' | 'commerce' | 'badges' | 'social';
  isPublic: boolean;
  label: string;
  description?: string;
}

export const DEFAULT_SETTINGS: SettingDefinition[] = [
  // 1. General Store Identity
  {
    key: 'store_name',
    value: 'Apexbyte Laptops Kenya',
    type: 'string',
    group: 'general',
    isPublic: true,
    label: 'Store Name',
    description: 'The primary brand name displayed across the website and emails',
  },
  {
    key: 'store_tagline',
    value: "Kisii's Trusted Laptop Destination",
    type: 'string',
    group: 'general',
    isPublic: true,
    label: 'Store Tagline / Slogan',
    description: 'Short slogan shown under the logo and in marketing headings',
  },
  {
    key: 'store_description',
    value: 'Kisii CBD premier laptop showroom and trusted e-commerce destination for HP, Dell, Lenovo, Apple, and Asus laptops with local 1-year warranty.',
    type: 'string',
    group: 'general',
    isPublic: true,
    label: 'Meta Description / About Brief',
    description: 'Public description used in search results and about sections',
  },

  // 2. Showroom & Contact Information
  {
    key: 'showroom_address',
    value: 'Mocha Place, 2nd Floor, Hospital Road, Kisii Town',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Physical Showroom Address',
    description: 'Building and street address displayed in the header, footer, and checkout',
  },
  {
    key: 'showroom_city',
    value: 'Kisii CBD, Kenya',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Town / Region',
    description: 'City or county location',
  },
  {
    key: 'phone_primary',
    value: '+254 104 504 692',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Primary Phone / Hotline',
    description: 'Direct call number shown in the top notice bar and footer',
  },
  {
    key: 'phone_secondary',
    value: '+254 700 000 000',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Secondary Phone / Support line',
    description: 'Alternative support line',
  },
  {
    key: 'whatsapp_number',
    value: '+254104504692',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'WhatsApp Chat Number',
    description: 'Phone number in international format for floating WhatsApp button (e.g. +254104504692)',
  },
  {
    key: 'support_email',
    value: 'support@apexbyte.co.ke',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Customer Support Email',
    description: 'Email for inquiries, orders, and customer correspondence',
  },
  {
    key: 'hours_weekdays',
    value: 'Mon - Fri: 8:00 AM - 6:30 PM',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Weekday Working Hours',
    description: 'Showroom open hours Monday to Friday',
  },
  {
    key: 'hours_saturday',
    value: 'Sat: 8:30 AM - 6:00 PM',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Saturday Working Hours',
    description: 'Showroom open hours on Saturdays',
  },
  {
    key: 'hours_sunday',
    value: 'Sun: 10:00 AM - 4:00 PM',
    type: 'string',
    group: 'contact',
    isPublic: true,
    label: 'Sunday Working Hours',
    description: 'Showroom open hours on Sundays',
  },

  // 3. Top Site-wide Notice / Announcement Bar
  {
    key: 'announcement_enabled',
    value: 'true',
    type: 'boolean',
    group: 'announcement',
    isPublic: true,
    label: 'Enable Top Notice Bar',
    description: 'Show or hide the notice banner at the very top of all pages',
  },
  {
    key: 'announcement_badge',
    value: 'Kisii CBD Showroom Open Today',
    type: 'string',
    group: 'announcement',
    isPublic: true,
    label: 'Notice Badge Text',
    description: 'Green pulsing badge label in top notice bar',
  },
  {
    key: 'announcement_text',
    value: '🚚 Same-Day Delivery across Kisii, Nyamira & South Nyanza • Showroom Open Today',
    type: 'string',
    group: 'announcement',
    isPublic: true,
    label: 'Notice Bar Announcement Message',
    description: 'Promotional or delivery notice message shown to all visitors',
  },
  {
    key: 'announcement_link',
    value: '/contact',
    type: 'string',
    group: 'announcement',
    isPublic: true,
    label: 'Notice Bar Click Link',
    description: 'URL navigated to when users click the notice banner',
  },

  // 4. Homepage Hero Section
  {
    key: 'hero_title',
    value: 'Next-Gen Laptops for Professionals, Gamers & Creators',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Main Title',
    description: 'Primary headline on the homepage landing page',
  },
  {
    key: 'hero_subtitle',
    value: 'Certified genuine HP, Dell, Lenovo, Apple and Asus machines with 1-Year Local Kisii Warranty, flexible M-Pesa payments, and same-day delivery.',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Subtitle / Description',
    description: 'Supporting paragraph under the main hero title',
  },
  {
    key: 'hero_cta_primary_text',
    value: 'Shop All Laptops',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Primary Button Text',
    description: 'Text for main call to action button',
  },
  {
    key: 'hero_cta_primary_link',
    value: '/shop',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Primary Button Link',
    description: 'Route destination for main CTA button',
  },
  {
    key: 'hero_cta_secondary_text',
    value: 'Find My Match',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Secondary Button Text',
    description: 'Text for secondary action button',
  },
  {
    key: 'hero_cta_secondary_link',
    value: '/finder',
    type: 'string',
    group: 'hero',
    isPublic: true,
    label: 'Hero Secondary Button Link',
    description: 'Route destination for secondary button',
  },

  // 5. Commerce & Checkout Rules
  {
    key: 'shipping_fee',
    value: '500',
    type: 'number',
    group: 'commerce',
    isPublic: true,
    label: 'Standard Delivery / Courier Fee (KSh)',
    description: 'Default shipping fee applied at checkout for orders below the threshold',
  },
  {
    key: 'free_shipping_threshold',
    value: '50000',
    type: 'number',
    group: 'commerce',
    isPublic: true,
    label: 'Free Delivery Minimum Order Amount (KSh)',
    description: 'Orders with a subtotal equal or exceeding this qualify for free delivery',
  },
  {
    key: 'tax_rate_percent',
    value: '8',
    type: 'number',
    group: 'commerce',
    isPublic: true,
    label: 'VAT Tax Rate (%)',
    description: 'Value-added tax percentage applied to orders (e.g. 8 for 8%)',
  },
  {
    key: 'currency_code',
    value: 'KES',
    type: 'string',
    group: 'commerce',
    isPublic: true,
    label: 'Currency Code',
    description: 'ISO currency identifier (e.g. KES)',
  },
  {
    key: 'currency_symbol',
    value: 'KSh',
    type: 'string',
    group: 'commerce',
    isPublic: true,
    label: 'Currency Display Symbol',
    description: 'Prefix symbol used on price tags (e.g. KSh)',
  },

  // 6. Trust Badges & Value Propositions
  {
    key: 'badge_warranty',
    value: '1-Year Local Warranty on all machines',
    type: 'string',
    group: 'badges',
    isPublic: true,
    label: 'Warranty Guarantee Badge',
    description: 'Trust badge displayed under product cards and value section',
  },
  {
    key: 'badge_delivery',
    value: 'Same-Day Delivery in Kisii & South Nyanza',
    type: 'string',
    group: 'badges',
    isPublic: true,
    label: 'Delivery Promise Badge',
    description: 'Delivery speed guarantee text',
  },
  {
    key: 'badge_returns',
    value: '7-Day Easy Swap & Return Guarantee',
    type: 'string',
    group: 'badges',
    isPublic: true,
    label: 'Returns Policy Badge',
    description: 'Returns guarantee text',
  },
  {
    key: 'badge_pickup',
    value: 'Showroom Pickup at Mocha Place, Hospital Road',
    type: 'string',
    group: 'badges',
    isPublic: true,
    label: 'Showroom Pickup Badge',
    description: 'Physical pickup guarantee text',
  },

  // 7. Social Media Links
  {
    key: 'social_facebook',
    value: 'https://facebook.com/apexbytelaptops',
    type: 'string',
    group: 'social',
    isPublic: true,
    label: 'Facebook Page URL',
    description: 'Link to official Facebook account',
  },
  {
    key: 'social_twitter',
    value: 'https://x.com/apexbytelaptops',
    type: 'string',
    group: 'social',
    isPublic: true,
    label: 'X (Twitter) Profile URL',
    description: 'Link to official Twitter / X profile',
  },
  {
    key: 'social_instagram',
    value: 'https://instagram.com/apexbytelaptops',
    type: 'string',
    group: 'social',
    isPublic: true,
    label: 'Instagram Page URL',
    description: 'Link to official Instagram profile',
  },
  {
    key: 'social_tiktok',
    value: 'https://tiktok.com/@apexbytelaptops',
    type: 'string',
    group: 'social',
    isPublic: true,
    label: 'TikTok Profile URL',
    description: 'Link to official TikTok account',
  },
];

export class SettingService {
  /**
   * Retrieves all public settings as a key-value dictionary for public frontend consumers.
   * Merges database values with defaults so all required keys are always present.
   */
  async getPublicSettings(): Promise<Record<string, any>> {
    // 1. Start with defaults
    const result: Record<string, any> = {};
    for (const def of DEFAULT_SETTINGS) {
      if (def.isPublic) {
        result[def.key] = this.castValue(def.value, def.type);
      }
    }

    // 2. Fetch overrides from database
    const dbSettings = await prisma.setting.findMany({
      where: { isPublic: true },
    });

    for (const s of dbSettings) {
      result[s.key] = this.castValue(s.value, s.type as any);
    }

    return result;
  }

  /**
   * Retrieves all settings (including metadata, labels, and groups) for Admin Console.
   */
  async getAllSettingsAdmin(): Promise<{
    settings: Record<string, any>;
    definitions: SettingDefinition[];
  }> {
    const dbSettings = await prisma.setting.findMany();
    const dbMap = new Map(dbSettings.map((s) => [s.key, s]));

    const settings: Record<string, any> = {};
    const definitions: SettingDefinition[] = [];

    for (const def of DEFAULT_SETTINGS) {
      const dbEntry = dbMap.get(def.key);
      const activeValue = dbEntry ? dbEntry.value : def.value;

      settings[def.key] = this.castValue(activeValue, def.type);
      definitions.push({
        ...def,
        value: activeValue,
      });
    }

    return { settings, definitions };
  }

  /**
   * Bulk updates or creates settings from admin key-value input.
   */
  async updateSettings(updates: Record<string, any>): Promise<Record<string, any>> {
    const defMap = new Map(DEFAULT_SETTINGS.map((d) => [d.key, d]));

    const operations = Object.entries(updates).map(([key, val]) => {
      const def = defMap.get(key);
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      const type = def?.type || 'string';
      const group = def?.group || 'general';
      const isPublic = def ? def.isPublic : true;

      return prisma.setting.upsert({
        where: { key },
        update: {
          value: strVal,
          type,
          group,
          isPublic,
        },
        create: {
          key,
          value: strVal,
          type,
          group,
          isPublic,
        },
      });
    });

    await prisma.$transaction(operations);

    return this.getPublicSettings();
  }

  private castValue(val: string, type: 'string' | 'number' | 'boolean' | 'json'): any {
    if (type === 'number') {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }
    if (type === 'boolean') {
      return val === 'true' || val === '1';
    }
    if (type === 'json') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }
}

export default new SettingService();

