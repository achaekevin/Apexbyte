import { useQuery } from '@tanstack/react-query';
import settingService, { PublicSettings } from '../services/settingService';

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  store_name: 'Apexbyte Laptops Kenya',
  store_tagline: "Kisii's Trusted Laptop Destination",
  store_description:
    'Kisii CBD premier laptop showroom and trusted e-commerce destination for HP, Dell, Lenovo, Apple, and Asus laptops with local 1-year warranty.',
  showroom_address: 'Mocha Place, 2nd Floor, Hospital Road, Kisii Town',
  showroom_city: 'Kisii CBD, Kenya',
  phone_primary: '+254 104 504 692',
  phone_secondary: '+254 700 000 000',
  whatsapp_number: '+254104504692',
  support_email: 'support@apexbyte.co.ke',
  hours_weekdays: 'Mon - Fri: 8:00 AM - 6:30 PM',
  hours_saturday: 'Sat: 8:30 AM - 6:00 PM',
  hours_sunday: 'Sun: 10:00 AM - 4:00 PM',
  announcement_enabled: true,
  announcement_badge: 'Kisii CBD Showroom Open Today',
  announcement_text: 'Same-Day Delivery across Kisii, Nyamira & South Nyanza • Showroom Open Today',
  announcement_link: '/contact',
  hero_title: 'Tested & Warranted Laptops in Kisii CBD',
  hero_subtitle:
    'Certified genuine HP, Dell, Lenovo, Apple and Asus machines with 1-Year Local Kisii Warranty, flexible M-Pesa payments, and same-day delivery.',
  hero_cta_primary_text: 'Shop All Laptops',
  hero_cta_primary_link: '/shop',
  hero_cta_secondary_text: 'Find My Match',
  hero_cta_secondary_link: '/finder',
  shipping_fee: 500,
  free_shipping_threshold: 50000,
  tax_rate_percent: 8,
  currency_code: 'KES',
  currency_symbol: 'KSh',
  badge_warranty: '1-Year Local Warranty on all machines',
  badge_delivery: 'Same-Day Delivery in Kisii & South Nyanza',
  badge_returns: '7-Day Easy Swap & Return Guarantee',
  badge_pickup: 'Showroom Pickup at Mocha Place, Hospital Road',
  social_facebook: 'https://facebook.com/apexbytelaptops',
  social_twitter: 'https://x.com/apexbytelaptops',
  social_instagram: 'https://instagram.com/apexbytelaptops',
  social_tiktok: 'https://tiktok.com/@apexbytelaptops',
};

export const useSettings = () => {
  const query = useQuery({
    queryKey: ['public-settings'],
    queryFn: settingService.getPublicSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const settings: PublicSettings = {
    ...DEFAULT_PUBLIC_SETTINGS,
    ...(query.data || {}),
  };

  return {
    settings,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export default useSettings;

