import { PrismaClient, UserRole, ProcessorBrand, GPUBrand, OperatingSystem } from '@prisma/client';
import { hashPassword } from '../src/utils/helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Kenyan Shilling (KES) and 125+ laptops...');

  // Clear existing data in correct dependency order
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVideo.deleteMany();
  await prisma.comparisonItem.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // 1. Create Admin User
  const adminPassword = await hashPassword('Admin@12345');
  await prisma.user.create({
    data: {
      email: 'admin@laptopstore.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
    },
  });

  // 2. Create Test Customer
  const customerPassword = await hashPassword('Customer@123');
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Kamau',
      phone: '+254712345678',
      isVerified: true,
    },
  });

  console.log('✅ Users created');

  // 3. Create Brands (10 Brands)
  const brandData = [
    {
      name: 'Apple',
      slug: 'apple',
      description: 'Premium MacBooks engineered with Apple Silicon M-series chips',
      logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200',
      order: 1,
    },
    {
      name: 'Dell',
      slug: 'dell',
      description: 'Award-winning XPS, Latitude, Inspiron, and Alienware systems',
      logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
      order: 2,
    },
    {
      name: 'HP',
      slug: 'hp',
      description: 'Versatile Spectre, Envy, Omen, and EliteBook computers',
      logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200',
      order: 3,
    },
    {
      name: 'Lenovo',
      slug: 'lenovo',
      description: 'World-renowned ThinkPad, Legion gaming, and Yoga convertibles',
      logo: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200',
      order: 4,
    },
    {
      name: 'ASUS',
      slug: 'asus',
      description: 'Cutting-edge ROG gaming rigs, ZenBook OLEDs, and TUF laptops',
      logo: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200',
      order: 5,
    },
    {
      name: 'Acer',
      slug: 'acer',
      description: 'Value-driven Aspire, ultra-light Swift, and Predator gaming powerhouses',
      logo: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200',
      order: 6,
    },
    {
      name: 'MSI',
      slug: 'msi',
      description: 'Extreme performance gaming, creator workstations, and Stealth rigs',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200',
      order: 7,
    },
    {
      name: 'Razer',
      slug: 'razer',
      description: 'Ultra-luxurious gaming laptops with anodized CNC aluminum chassis',
      logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200',
      order: 8,
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      description: 'Elegant Surface Laptops, Surface Studios, and versatile 2-in-1s',
      logo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
      order: 9,
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Ultra-slim Galaxy Books featuring stunning Dynamic AMOLED 2X displays',
      logo: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200',
      order: 10,
    },
  ];

  const brands = await Promise.all(
    brandData.map((b) =>
      prisma.brand.create({
        data: b,
      })
    )
  );
  const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b.id]));
  console.log('✅ Brands created (10 brands)');

  // 4. Create Categories (6 Categories)
  const categoryData = [
    {
      name: 'Gaming Laptops',
      slug: 'gaming-laptops',
      description: 'High-refresh displays and discrete NVIDIA/AMD graphics for intense gaming',
      icon: '🎮',
      order: 1,
    },
    {
      name: 'Business Laptops',
      slug: 'business-laptops',
      description: 'Secure, durable, long battery life machines for executives and professionals',
      icon: '💼',
      order: 2,
    },
    {
      name: 'Student Laptops',
      slug: 'student-laptops',
      description: 'Affordable, dependable, all-day laptops for coursework and daily tasks',
      icon: '🎓',
      order: 3,
    },
    {
      name: 'Ultrabooks',
      slug: 'ultrabooks',
      description: 'Featherlight, razor-thin premium laptops with exceptional mobility and style',
      icon: '✨',
      order: 4,
    },
    {
      name: 'Workstations',
      slug: 'workstations',
      description: 'Heavy compute power, massive RAM, and professional GPUs for CAD and 3D rendering',
      icon: '🎨',
      order: 5,
    },
    {
      name: '2-in-1 Convertibles',
      slug: '2-in-1-convertibles',
      description: '360-degree hinges with touchscreen and stylus support for ultimate versatility',
      icon: '🔄',
      order: 6,
    },
  ];

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.create({
        data: c,
      })
    )
  );
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log('✅ Categories created (6 categories)');

  // Curated High-Definition Unsplash Photo URLs for Laptop Galleries
  const laptopImageGalleries: Record<string, string[]> = {
    apple: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    ],
    dell: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
      'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800',
      'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800',
    ],
    hp: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    ],
    lenovo: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
      'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800',
    ],
    asus: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      'https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800',
    ],
    acer: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800',
      'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=800',
    ],
    msi: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    ],
    razer: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    ],
    microsoft: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      'https://images.unsplash.com/photo-1575024357670-2b5164f470c3?w=800',
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800',
    ],
    samsung: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
      'https://images.unsplash.com/photo-1593642634361-83e5275d40c5?w=800',
      'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800',
    ],
  };

  // 5. Generate 125 Distinct Realistic Laptop Models with Authentic Kenyan Shillings Pricing
  interface LaptopSeedDef {
    brandSlug: string;
    categorySlug: string;
    sku: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number; // in KES
    compareAtPrice: number; // in KES
    discount: number;
    stock: number;
    processor: string;
    processorBrand: ProcessorBrand;
    processorGen?: string;
    ram: number;
    ramType: string;
    storage: number;
    storageType: string;
    gpu?: string;
    gpuBrand?: GPUBrand;
    gpuMemory?: number;
    displaySize: number;
    displayResolution: string;
    displayType: string;
    refreshRate: number;
    touchscreen?: boolean;
    color: string;
    batteryLife: string;
    os: OperatingSystem;
    weight: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
  }

  const rawLaptops: LaptopSeedDef[] = [];

  // --- 1. APPLE (15 models: KSh 115,000 to KSh 485,000) ---
  const appleModels = [
    { name: 'MacBook Air 13" M1 (8GB, 256GB)', sku: 'APL-MBA13-M1-256', cat: 'student-laptops', price: 115000, ram: 8, storage: 256, cpu: 'Apple M1', gpu: 'Apple M1 7-Core GPU', size: 13.3, res: '2560 x 1600', color: 'Space Gray', weight: 1.29, best: true },
    { name: 'MacBook Air 13" M2 (8GB, 256GB)', sku: 'APL-MBA13-M2-256', cat: 'ultrabooks', price: 145000, ram: 8, storage: 256, cpu: 'Apple M2', gpu: 'Apple M2 8-Core GPU', size: 13.6, res: '2560 x 1664', color: 'Midnight', weight: 1.24, best: true },
    { name: 'MacBook Air 13" M2 (16GB, 512GB)', sku: 'APL-MBA13-M2-512', cat: 'ultrabooks', price: 185000, ram: 16, storage: 512, cpu: 'Apple M2', gpu: 'Apple M2 10-Core GPU', size: 13.6, res: '2560 x 1664', color: 'Starlight', weight: 1.24 },
    { name: 'MacBook Air 15" M2 (8GB, 256GB)', sku: 'APL-MBA15-M2-256', cat: 'ultrabooks', price: 165000, ram: 8, storage: 256, cpu: 'Apple M2', gpu: 'Apple M2 10-Core GPU', size: 15.3, res: '2880 x 1864', color: 'Silver', weight: 1.51 },
    { name: 'MacBook Air 15" M2 (16GB, 512GB)', sku: 'APL-MBA15-M2-512', cat: 'ultrabooks', price: 210000, ram: 16, storage: 512, cpu: 'Apple M2', gpu: 'Apple M2 10-Core GPU', size: 15.3, res: '2880 x 1864', color: 'Space Gray', weight: 1.51 },
    { name: 'MacBook Air 13" M3 (8GB, 256GB)', sku: 'APL-MBA13-M3-256', cat: 'ultrabooks', price: 168000, ram: 8, storage: 256, cpu: 'Apple M3', gpu: 'Apple M3 8-Core GPU', size: 13.6, res: '2560 x 1664', color: 'Midnight', weight: 1.24, newArr: true },
    { name: 'MacBook Air 13" M3 (16GB, 512GB)', sku: 'APL-MBA13-M3-512', cat: 'ultrabooks', price: 215000, ram: 16, storage: 512, cpu: 'Apple M3', gpu: 'Apple M3 10-Core GPU', size: 13.6, res: '2560 x 1664', color: 'Starlight', weight: 1.24, feat: true },
    { name: 'MacBook Air 15" M3 (16GB, 512GB)', sku: 'APL-MBA15-M3-512', cat: 'ultrabooks', price: 235000, ram: 16, storage: 512, cpu: 'Apple M3', gpu: 'Apple M3 10-Core GPU', size: 15.3, res: '2880 x 1864', color: 'Silver', weight: 1.51, feat: true },
    { name: 'MacBook Pro 14" M3 (8GB, 512GB)', sku: 'APL-MBP14-M3-512', cat: 'business-laptops', price: 245000, ram: 8, storage: 512, cpu: 'Apple M3', gpu: 'Apple M3 10-Core GPU', size: 14.2, res: '3024 x 1964', color: 'Space Gray', weight: 1.55 },
    { name: 'MacBook Pro 14" M3 Pro (18GB, 512GB)', sku: 'APL-MBP14-M3P-512', cat: 'workstations', price: 310000, ram: 18, storage: 512, cpu: 'Apple M3 Pro', gpu: 'Apple M3 Pro 14-Core GPU', size: 14.2, res: '3024 x 1964', color: 'Space Black', weight: 1.61, feat: true, newArr: true },
    { name: 'MacBook Pro 14" M3 Pro (36GB, 1TB)', sku: 'APL-MBP14-M3P-1TB', cat: 'workstations', price: 385000, ram: 36, storage: 1000, cpu: 'Apple M3 Pro', gpu: 'Apple M3 Pro 18-Core GPU', size: 14.2, res: '3024 x 1964', color: 'Space Black', weight: 1.61 },
    { name: 'MacBook Pro 14" M3 Max (36GB, 1TB)', sku: 'APL-MBP14-M3M-1TB', cat: 'workstations', price: 445000, ram: 36, storage: 1000, cpu: 'Apple M3 Max', gpu: 'Apple M3 Max 30-Core GPU', size: 14.2, res: '3024 x 1964', color: 'Space Black', weight: 1.62 },
    { name: 'MacBook Pro 16" M3 Pro (18GB, 512GB)', sku: 'APL-MBP16-M3P-512', cat: 'workstations', price: 375000, ram: 18, storage: 512, cpu: 'Apple M3 Pro', gpu: 'Apple M3 Pro 18-Core GPU', size: 16.2, res: '3456 x 2234', color: 'Space Black', weight: 2.14 },
    { name: 'MacBook Pro 16" M3 Pro (36GB, 512GB)', sku: 'APL-MBP16-M3P-1TB', cat: 'workstations', price: 420000, ram: 36, storage: 1000, cpu: 'Apple M3 Pro', gpu: 'Apple M3 Pro 18-Core GPU', size: 16.2, res: '3456 x 2234', color: 'Silver', weight: 2.14 },
    { name: 'MacBook Pro 16" M3 Max (48GB, 1TB)', sku: 'APL-MBP16-M3M-1TB', cat: 'workstations', price: 485000, ram: 48, storage: 1000, cpu: 'Apple M3 Max', gpu: 'Apple M3 Max 40-Core GPU', size: 16.2, res: '3456 x 2234', color: 'Space Black', weight: 2.16, feat: true },
  ];

  appleModels.forEach((m) => {
    rawLaptops.push({
      brandSlug: 'apple',
      categorySlug: m.cat,
      sku: m.sku,
      name: m.name,
      slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: `Experience premier computing with the ${m.name}. Crafted with precision CNC aluminum, Liquid Retina display, industry-leading battery efficiency, and lightning-fast Apple Silicon.`,
      shortDescription: `${m.cpu} with ${m.ram}GB Unified Memory & ${m.storage}GB SSD storage`,
      price: m.price,
      compareAtPrice: Math.round(m.price * 1.1),
      discount: 9,
      stock: Math.floor(Math.random() * 25) + 5,
      processor: m.cpu,
      processorBrand: ProcessorBrand.APPLE,
      ram: m.ram,
      ramType: 'Unified Memory',
      storage: m.storage,
      storageType: 'SSD',
      gpu: m.gpu,
      gpuBrand: GPUBrand.APPLE,
      gpuMemory: m.ram,
      displaySize: m.size,
      displayResolution: m.res,
      displayType: 'Liquid Retina XDR',
      refreshRate: m.name.includes('Pro') ? 120 : 60,
      color: m.color,
      batteryLife: 'Up to 18-22 hours',
      os: OperatingSystem.MACOS,
      weight: m.weight,
      isFeatured: !!m.feat,
      isNewArrival: !!m.newArr,
      isBestSeller: !!m.best,
    });
  });

  // Helper generator for other brands
  interface BrandDefItem {
    name: string;
    cat: string;
    price: number;
    ram: number;
    storage: number;
    cpu: string;
    cpuBrand: ProcessorBrand;
    gpu: string;
    gpuBrand: GPUBrand;
    gpuMem?: number;
    size: number;
    res: string;
    refresh?: number;
    touch?: boolean;
    color: string;
    feat?: boolean;
    newArr?: boolean;
    best?: boolean;
  }

  // --- 2. DELL (15 models: KSh 48,000 to KSh 420,000) ---
  const dellModels: BrandDefItem[] = [
    { name: 'Dell Inspiron 15 3520 (Intel i3, 8GB, 256GB)', cat: 'student-laptops', price: 48000, ram: 8, storage: 256, cpu: 'Intel Core i3-1215U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Carbon Black' },
    { name: 'Dell Inspiron 15 3520 (Intel i5, 16GB, 512GB)', cat: 'student-laptops', price: 68000, ram: 16, storage: 512, cpu: 'Intel Core i5-1235U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Platinum Silver', best: true },
    { name: 'Dell Inspiron 16 5630 (Intel i7, 16GB, 1TB)', cat: 'business-laptops', price: 118000, ram: 16, storage: 1000, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 16.0, res: '1920 x 1200', color: 'Platinum Silver' },
    { name: 'Dell Inspiron 14 2-in-1 (Ryzen 7, 16GB, 512GB)', cat: '2-in-1-convertibles', price: 105000, ram: 16, storage: 512, cpu: 'AMD Ryzen 7 7730U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon Graphics', gpuBrand: GPUBrand.AMD, size: 14.0, res: '1920 x 1200', touch: true, color: 'Pebble Green' },
    { name: 'Dell Latitude 3540 (Intel i5, 16GB, 512GB)', cat: 'business-laptops', price: 89000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Titan Gray' },
    { name: 'Dell Latitude 5440 (Intel i7, 16GB, 512GB)', cat: 'business-laptops', price: 145000, ram: 16, storage: 512, cpu: 'Intel Core i7-1365U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1080', color: 'Warm Silver', feat: true },
    { name: 'Dell Latitude 7440 Ultralight (Intel i7, 32GB, 1TB)', cat: 'business-laptops', price: 215000, ram: 32, storage: 1000, cpu: 'Intel Core i7-1370P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'River Blue', feat: true },
    { name: 'Dell XPS 13 9315 (Intel i5, 16GB, 512GB)', cat: 'ultrabooks', price: 155000, ram: 16, storage: 512, cpu: 'Intel Core i5-1230U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.4, res: '1920 x 1200', color: 'Sky Blue', best: true },
    { name: 'Dell XPS 13 Plus 9320 (Intel i7, 16GB, 512GB)', cat: 'ultrabooks', price: 195000, ram: 16, storage: 512, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.4, res: '3456 x 2160', color: 'Platinum', feat: true },
    { name: 'Dell XPS 14 9440 (Intel Core Ultra 7, 32GB, 1TB)', cat: 'ultrabooks', price: 265000, ram: 32, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 14.5, res: '3200 x 2000', color: 'Graphite', newArr: true },
    { name: 'Dell XPS 15 9530 (Intel i7, 32GB, 1TB, RTX 4060)', cat: 'workstations', price: 285000, ram: 32, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 15.6, res: '3456 x 2160', color: 'Silver/Black', feat: true },
    { name: 'Dell XPS 16 9640 (Intel Core Ultra 9, 32GB, 2TB, RTX 4070)', cat: 'workstations', price: 360000, ram: 32, storage: 2000, cpu: 'Intel Core Ultra 9 185H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.3, res: '3840 x 2400', color: 'Platinum', newArr: true },
    { name: 'Dell G15 5530 (Intel i7, 16GB, 512GB, RTX 4050)', cat: 'gaming-laptops', price: 140000, ram: 16, storage: 512, cpu: 'Intel Core i7-13650HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '1920 x 1080', refresh: 165, color: 'Dark Shadow Gray' },
    { name: 'Dell Alienware m16 R2 (Intel Ultra 7, 16GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 275000, ram: 16, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Dark Metallic Moon', feat: true },
    { name: 'Dell Alienware m18 R2 (Intel i9, 64GB, 2TB, RTX 4090)', cat: 'gaming-laptops', price: 420000, ram: 64, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4090', gpuBrand: GPUBrand.NVIDIA, gpuMem: 16, size: 18.0, res: '2560 x 1600', refresh: 165, color: 'Dark Metallic Moon', feat: true },
  ];

  // --- 3. HP (15 models: KSh 39,000 to KSh 340,000) ---
  const hpModels: BrandDefItem[] = [
    { name: 'HP 15-dw (Intel Celeron, 8GB, 256GB)', cat: 'student-laptops', price: 39000, ram: 8, storage: 256, cpu: 'Intel Celeron N4500', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1366 x 768', color: 'Jet Black' },
    { name: 'HP 15-fd (Intel i3, 8GB, 512GB)', cat: 'student-laptops', price: 52000, ram: 8, storage: 512, cpu: 'Intel Core i3-1315U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Natural Silver', best: true },
    { name: 'HP 15-fc (AMD Ryzen 5, 16GB, 512GB)', cat: 'student-laptops', price: 69000, ram: 16, storage: 512, cpu: 'AMD Ryzen 5 7520U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon 610M', gpuBrand: GPUBrand.AMD, size: 15.6, res: '1920 x 1080', color: 'Warm Gold' },
    { name: 'HP Pavilion 15 (Intel i5, 16GB, 512GB)', cat: 'student-laptops', price: 82000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Natural Silver', best: true },
    { name: 'HP Pavilion Plus 14 (OLED, i7, 16GB, 1TB)', cat: 'ultrabooks', price: 125000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 90, color: 'Space Blue', feat: true },
    { name: 'HP Envy x360 15 (Intel i7, 16GB, 512GB)', cat: '2-in-1-convertibles', price: 135000, ram: 16, storage: 512, cpu: 'Intel Core i7-1355U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', touch: true, color: 'Nightfall Black' },
    { name: 'HP Envy 16 (Intel i7, 32GB, 1TB, RTX 4060)', cat: 'workstations', price: 215000, ram: 32, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 120, color: 'Natural Silver', feat: true },
    { name: 'HP Spectre x360 14 (OLED, Intel Ultra 7, 16GB, 1TB)', cat: 'ultrabooks', price: 225000, ram: 16, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', touch: true, color: 'Slate Blue', newArr: true, feat: true },
    { name: 'HP Spectre x360 16 (Intel Ultra 7, 32GB, 2TB, RTX 4050)', cat: 'ultrabooks', price: 275000, ram: 32, storage: 2000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 16.0, res: '2880 x 1800', touch: true, color: 'Nightfall Black' },
    { name: 'HP ProBook 450 G10 (Intel i5, 16GB, 512GB)', cat: 'business-laptops', price: 92000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Pike Silver' },
    { name: 'HP EliteBook 840 G10 (Intel i7, 16GB, 512GB)', cat: 'business-laptops', price: 165000, ram: 16, storage: 512, cpu: 'Intel Core i7-1365U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Natural Silver', feat: true },
    { name: 'HP EliteBook 1040 G10 (Intel i7, 32GB, 1TB)', cat: 'business-laptops', price: 235000, ram: 32, storage: 1000, cpu: 'Intel Core i7-1370P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Silver' },
    { name: 'HP Victus 15 (Intel i5, 16GB, 512GB, RTX 3050)', cat: 'gaming-laptops', price: 110000, ram: 16, storage: 512, cpu: 'Intel Core i5-13420H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 3050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Mica Silver' },
    { name: 'HP Victus 16 (Ryzen 7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 165000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 7 7840HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.1, res: '1920 x 1080', refresh: 144, color: 'Performance Blue' },
    { name: 'HP Omen Transcend 16 (Intel i9, 32GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 310000, ram: 32, storage: 1000, cpu: 'Intel Core i9-13900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Shadow Black', feat: true },
  ];

  // --- 4. LENOVO (15 models: KSh 36,000 to KSh 390,000) ---
  const lenovoModels: BrandDefItem[] = [
    { name: 'Lenovo IdeaPad 1 15 (Intel Celeron, 8GB, 256GB)', cat: 'student-laptops', price: 36000, ram: 8, storage: 256, cpu: 'Intel Celeron N4020', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1366 x 768', color: 'Cloud Grey' },
    { name: 'Lenovo IdeaPad 3 15 (Ryzen 5, 16GB, 512GB)', cat: 'student-laptops', price: 62000, ram: 16, storage: 512, cpu: 'AMD Ryzen 5 5500U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon Graphics', gpuBrand: GPUBrand.AMD, size: 15.6, res: '1920 x 1080', color: 'Abyss Blue', best: true },
    { name: 'Lenovo IdeaPad Slim 5 16 (Intel i7, 16GB, 512GB)', cat: 'student-laptops', price: 88000, ram: 16, storage: 512, cpu: 'Intel Core i7-1355U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 16.0, res: '1920 x 1200', color: 'Cloud Grey' },
    { name: 'Lenovo ThinkPad E14 Gen 5 (Intel i5, 16GB, 512GB)', cat: 'business-laptops', price: 98000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Black' },
    { name: 'Lenovo ThinkPad E16 Gen 1 (Ryzen 7, 16GB, 512GB)', cat: 'business-laptops', price: 112000, ram: 16, storage: 512, cpu: 'AMD Ryzen 7 7730U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon Graphics', gpuBrand: GPUBrand.AMD, size: 16.0, res: '1920 x 1200', color: 'Black' },
    { name: 'Lenovo ThinkPad T14 Gen 4 (Intel i7, 16GB, 512GB)', cat: 'business-laptops', price: 175000, ram: 16, storage: 512, cpu: 'Intel Core i7-1365U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Thunder Black', feat: true, best: true },
    { name: 'Lenovo ThinkPad T16 Gen 2 (Intel i7, 32GB, 1TB)', cat: 'business-laptops', price: 210000, ram: 32, storage: 1000, cpu: 'Intel Core i7-1370P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 16.0, res: '1920 x 1200', color: 'Thunder Black' },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11 (i7, 16GB, 1TB)', cat: 'ultrabooks', price: 245000, ram: 16, storage: 1000, cpu: 'Intel Core i7-1365U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', color: 'Deep Black Carbon', feat: true, best: true },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 12 (Ultra 7, 32GB, 1TB)', cat: 'ultrabooks', price: 315000, ram: 32, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', color: 'Deep Black Carbon', newArr: true, feat: true },
    { name: 'Lenovo Yoga 7i 14 (Intel i7, 16GB, 512GB)', cat: '2-in-1-convertibles', price: 145000, ram: 16, storage: 512, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2240 x 1400', touch: true, color: 'Storm Grey' },
    { name: 'Lenovo Yoga 9i Dual OLED (Intel i7, 16GB, 1TB)', cat: '2-in-1-convertibles', price: 265000, ram: 16, storage: 1000, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', touch: true, color: 'Oatmeal', feat: true },
    { name: 'Lenovo LOQ 15 (Ryzen 7, 16GB, 512GB, RTX 4050)', cat: 'gaming-laptops', price: 135000, ram: 16, storage: 512, cpu: 'AMD Ryzen 7 7840HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Storm Grey' },
    { name: 'Lenovo Legion 5 Slim (Ryzen 7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 185000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 7 7840HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 165, color: 'Misty Grey' },
    { name: 'Lenovo Legion Pro 7i (Intel i9, 32GB, 1TB, RTX 4080)', cat: 'gaming-laptops', price: 340000, ram: 32, storage: 1000, cpu: 'Intel Core i9-13900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Onyx Grey', feat: true },
    { name: 'Lenovo ThinkPad P16 Gen 2 (Intel i9, 64GB, 2TB, RTX 4000 Ada)', cat: 'workstations', price: 390000, ram: 64, storage: 2000, cpu: 'Intel Core i9-13980HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA RTX 4000 Ada', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 16.0, res: '3840 x 2400', color: 'Storm Grey', feat: true },
  ];

  // --- 5. ASUS (15 models: KSh 45,000 to KSh 435,000) ---
  const asusModels: BrandDefItem[] = [
    { name: 'ASUS Vivobook Go 15 (Celeron, 8GB, 256GB)', cat: 'student-laptops', price: 45000, ram: 8, storage: 256, cpu: 'Intel Celeron N4500', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Mixed Black' },
    { name: 'ASUS Vivobook 15 (Core i5, 16GB, 512GB)', cat: 'student-laptops', price: 72000, ram: 16, storage: 512, cpu: 'Intel Core i5-1235U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Quiet Blue', best: true },
    { name: 'ASUS Vivobook Pro 15 OLED (Ryzen 7, 16GB, 1TB, RTX 3050)', cat: 'ultrabooks', price: 135000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 7 7735HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 3050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '2880 x 1620', refresh: 120, color: 'Quiet Blue' },
    { name: 'ASUS Zenbook 14 OLED (Core i7, 16GB, 1TB)', cat: 'ultrabooks', price: 165000, ram: 16, storage: 1000, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 90, color: 'Ponder Blue', best: true },
    { name: 'ASUS Zenbook 14 OLED (Intel Ultra 7, 32GB, 1TB)', cat: 'ultrabooks', price: 215000, ram: 32, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 120, color: 'Foggy Silver', newArr: true, feat: true },
    { name: 'ASUS Zenbook DUO (Dual 14" OLED, Ultra 9, 32GB, 2TB)', cat: 'ultrabooks', price: 310000, ram: 32, storage: 2000, cpu: 'Intel Core Ultra 9 185H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', touch: true, color: 'Inkwell Gray', newArr: true, feat: true },
    { name: 'ASUS Zenbook S 13 OLED (Ultra 7, 16GB, 1TB)', cat: 'ultrabooks', price: 195000, ram: 16, storage: 1000, cpu: 'Intel Core Ultra 7 155U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Graphics', gpuBrand: GPUBrand.INTEL, size: 13.3, res: '2880 x 1800', color: 'Basalt Grey', feat: true },
    { name: 'ASUS TUF Gaming A15 (Ryzen 7, 16GB, 512GB, RTX 4050)', cat: 'gaming-laptops', price: 140000, ram: 16, storage: 512, cpu: 'AMD Ryzen 7 7735HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Mecha Gray' },
    { name: 'ASUS TUF Gaming F15 (Core i7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 175000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13620H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Jaeger Gray', best: true },
    { name: 'ASUS ROG Zephyrus G14 (Ryzen 9, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 235000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 9 8945HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.0, res: '2880 x 1800', refresh: 120, color: 'Eclipse Gray', feat: true },
    { name: 'ASUS ROG Zephyrus G16 (Core Ultra 9, 32GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 295000, ram: 32, storage: 1000, cpu: 'Intel Core Ultra 9 185H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Platinum White', feat: true },
    { name: 'ASUS ROG Strix G16 (Core i7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 195000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13650HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '1920 x 1200', refresh: 165, color: 'Eclipse Gray' },
    { name: 'ASUS ROG Strix SCAR 16 (Core i9, 32GB, 1TB, RTX 4080)', cat: 'gaming-laptops', price: 365000, ram: 32, storage: 1000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Off Black', feat: true },
    { name: 'ASUS ROG Strix SCAR 18 (Core i9, 64GB, 2TB, RTX 4090)', cat: 'gaming-laptops', price: 435000, ram: 64, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4090', gpuBrand: GPUBrand.NVIDIA, gpuMem: 16, size: 18.0, res: '2560 x 1600', refresh: 240, color: 'Off Black', feat: true },
    { name: 'ASUS ProArt StudioBook 16 (Intel i9, 64GB, 2TB, RTX 4070)', cat: 'workstations', price: 345000, ram: 64, storage: 2000, cpu: 'Intel Core i9-13980HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '3200 x 2000', refresh: 120, touch: true, color: 'Mineral Black' },
  ];

  // --- 6. ACER (12 models: KSh 32,000 to KSh 295,000) ---
  const acerModels: BrandDefItem[] = [
    { name: 'Acer Aspire 1 (Intel Celeron, 4GB, 128GB)', cat: 'student-laptops', price: 32000, ram: 8, storage: 256, cpu: 'Intel Celeron N4500', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1080', color: 'Pure Silver' },
    { name: 'Acer Aspire 3 15 (Ryzen 3, 8GB, 256GB)', cat: 'student-laptops', price: 44000, ram: 8, storage: 256, cpu: 'AMD Ryzen 3 7320U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon 610M', gpuBrand: GPUBrand.AMD, size: 15.6, res: '1920 x 1080', color: 'Silver' },
    { name: 'Acer Aspire 5 15 (Core i5, 16GB, 512GB)', cat: 'student-laptops', price: 68000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Steel Gray', best: true },
    { name: 'Acer Swift Go 14 (OLED, Core i7, 16GB, 512GB)', cat: 'ultrabooks', price: 115000, ram: 16, storage: 512, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 90, color: 'Sunshiny Gold', feat: true },
    { name: 'Acer Swift Go 14 (Intel Ultra 7, 16GB, 1TB)', cat: 'ultrabooks', price: 145000, ram: 16, storage: 1000, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 120, color: 'Pure Silver', newArr: true },
    { name: 'Acer Swift Edge 16 (4K OLED, Ryzen 7, 16GB, 1TB)', cat: 'ultrabooks', price: 175000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 7 7840U', cpuBrand: ProcessorBrand.AMD, gpu: 'AMD Radeon 780M', gpuBrand: GPUBrand.AMD, size: 16.0, res: '3200 x 2000', refresh: 120, color: 'Olivine Black', feat: true },
    { name: 'Acer Nitro 5 (Core i5, 16GB, 512GB, RTX 3050)', cat: 'gaming-laptops', price: 118000, ram: 16, storage: 512, cpu: 'Intel Core i5-12500H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 3050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 4, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Obsidian Black', best: true },
    { name: 'Acer Nitro 16 (Ryzen 7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 168000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 7 7840HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '1920 x 1200', refresh: 165, color: 'Black' },
    { name: 'Acer Predator Helios 16 (Core i7, 16GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 235000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13700HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Abyssal Black', feat: true },
    { name: 'Acer Predator Helios 18 (Core i9, 32GB, 2TB, RTX 4080)', cat: 'gaming-laptops', price: 295000, ram: 32, storage: 2000, cpu: 'Intel Core i9-13900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 18.0, res: '2560 x 1600', refresh: 250, color: 'Abyssal Black', feat: true },
    { name: 'Acer TravelMate P4 (Intel i7, 16GB, 512GB)', cat: 'business-laptops', price: 110000, ram: 16, storage: 512, cpu: 'Intel Core i7-1355U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Slate Blue' },
    { name: 'Acer Aspire Vero Eco (Core i5, 16GB, 512GB)', cat: 'student-laptops', price: 78000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Cobblestone Gray' },
  ];

  // --- 7. MSI (12 models: KSh 62,000 to KSh 440,000) ---
  const msiModels: BrandDefItem[] = [
    { name: 'MSI Modern 14 (Core i3, 8GB, 512GB)', cat: 'student-laptops', price: 62000, ram: 8, storage: 512, cpu: 'Intel Core i3-1215U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel UHD Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1080', color: 'Classic Black' },
    { name: 'MSI Modern 15 (Core i5, 16GB, 512GB)', cat: 'student-laptops', price: 78000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Star Blue' },
    { name: 'MSI Thin GF63 (Core i5, 16GB, 512GB, RTX 3050)', cat: 'gaming-laptops', price: 112000, ram: 16, storage: 512, cpu: 'Intel Core i5-12450H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 3050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 4, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Black', best: true },
    { name: 'MSI Cyborg 15 (Core i7, 16GB, 512GB, RTX 4050)', cat: 'gaming-laptops', price: 142000, ram: 16, storage: 512, cpu: 'Intel Core i7-12650H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Translucent Black' },
    { name: 'MSI Katana 15 (Core i7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 178000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13620H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 15.6, res: '1920 x 1080', refresh: 144, color: 'Black', best: true },
    { name: 'MSI Katana 17 (Core i7, 32GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 225000, ram: 32, storage: 1000, cpu: 'Intel Core i7-13620H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 17.3, res: '1920 x 1080', refresh: 144, color: 'Black' },
    { name: 'MSI Stealth 14 Studio (Core i7, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 235000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.0, res: '2560 x 1600', refresh: 165, color: 'Star Blue', feat: true },
    { name: 'MSI Stealth 16 Studio (Core i9, 32GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 295000, ram: 32, storage: 1000, cpu: 'Intel Core i9-13900H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 240, color: 'Pure White', feat: true },
    { name: 'MSI Raider GE78 HX (Core i9, 32GB, 2TB, RTX 4080)', cat: 'gaming-laptops', price: 375000, ram: 32, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 17.0, res: '2560 x 1600', refresh: 240, color: 'Core Black', feat: true },
    { name: 'MSI Titan 18 HX (Core i9, 64GB, 4TB, RTX 4090)', cat: 'gaming-laptops', price: 440000, ram: 64, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4090', gpuBrand: GPUBrand.NVIDIA, gpuMem: 16, size: 18.0, res: '3840 x 2400', refresh: 120, color: 'Core Black', feat: true },
    { name: 'MSI Prestige 14 EVO (Core i7, 16GB, 1TB)', cat: 'ultrabooks', price: 155000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '1920 x 1200', color: 'Urban Silver' },
    { name: 'MSI Creator Z16 HX Studio (Core i9, 32GB, 2TB, RTX 4070)', cat: 'workstations', price: 335000, ram: 32, storage: 2000, cpu: 'Intel Core i9-13950HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2560 x 1600', refresh: 120, touch: true, color: 'Lunar Gray' },
  ];

  // --- 8. RAZER (10 models: KSh 210,000 to KSh 520,000) ---
  const razerModels: BrandDefItem[] = [
    { name: 'Razer Blade 14 (Ryzen 9 7940HS, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 240000, ram: 16, storage: 1000, cpu: 'AMD Ryzen 9 7940HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.0, res: '2560 x 1600', refresh: 240, color: 'Matte Black', best: true },
    { name: 'Razer Blade 14 (Ryzen 9 8945HS, 32GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 295000, ram: 32, storage: 1000, cpu: 'AMD Ryzen 9 8945HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.0, res: '2560 x 1600', refresh: 240, color: 'Mercury White', newArr: true, feat: true },
    { name: 'Razer Blade 15 (Core i7-13800H, 16GB, 1TB, RTX 4060)', cat: 'gaming-laptops', price: 255000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13800H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 15.6, res: '2560 x 1440', refresh: 240, color: 'Matte Black' },
    { name: 'Razer Blade 15 OLED (Core i7, 16GB, 1TB, RTX 4070)', cat: 'gaming-laptops', price: 315000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13800H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 15.6, res: '2560 x 1440', refresh: 240, color: 'Matte Black', feat: true },
    { name: 'Razer Blade 16 Dual-Mode Mini-LED (Core i9, 32GB, 1TB, RTX 4080)', cat: 'gaming-laptops', price: 395000, ram: 32, storage: 1000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 16.0, res: '3840 x 2400', refresh: 240, color: 'Matte Black', feat: true },
    { name: 'Razer Blade 16 (Core i9, 32GB, 2TB, RTX 4090)', cat: 'gaming-laptops', price: 465000, ram: 32, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4090', gpuBrand: GPUBrand.NVIDIA, gpuMem: 16, size: 16.0, res: '3840 x 2400', refresh: 240, color: 'Mercury White', feat: true },
    { name: 'Razer Blade 18 (Core i9-14900HX, 32GB, 1TB, RTX 4080)', cat: 'workstations', price: 435000, ram: 32, storage: 1000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4080', gpuBrand: GPUBrand.NVIDIA, gpuMem: 12, size: 18.0, res: '2560 x 1600', refresh: 300, color: 'Matte Black' },
    { name: 'Razer Blade 18 (Core i9-14900HX, 64GB, 2TB, RTX 4090, 4K 200Hz)', cat: 'workstations', price: 520000, ram: 64, storage: 2000, cpu: 'Intel Core i9-14900HX', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4090', gpuBrand: GPUBrand.NVIDIA, gpuMem: 16, size: 18.0, res: '3840 x 2400', refresh: 200, color: 'Matte Black', feat: true },
    { name: 'Razer Book 13 (Core i7, 16GB, 512GB)', cat: 'ultrabooks', price: 165000, ram: 16, storage: 512, cpu: 'Intel Core i7-1165G7', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.4, res: '1920 x 1200', color: 'Mercury White' },
    { name: 'Razer Blade 14 Mercury Special (Ryzen 9, 32GB, 1TB, RTX 4070)', cat: 'ultrabooks', price: 305000, ram: 32, storage: 1000, cpu: 'AMD Ryzen 9 8945HS', cpuBrand: ProcessorBrand.AMD, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.0, res: '2560 x 1600', refresh: 240, color: 'Mercury White' },
  ];

  // --- 9. MICROSOFT (8 models: KSh 85,000 to KSh 360,000) ---
  const microsoftModels: BrandDefItem[] = [
    { name: 'Microsoft Surface Laptop Go 3 (Core i5, 8GB, 256GB)', cat: 'student-laptops', price: 85000, ram: 8, storage: 256, cpu: 'Intel Core i5-1235U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 12.4, res: '1536 x 1024', touch: true, color: 'Platinum', best: true },
    { name: 'Microsoft Surface Laptop 5 13.5" (Core i5, 8GB, 512GB)', cat: 'ultrabooks', price: 135000, ram: 8, storage: 512, cpu: 'Intel Core i5-1235U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.5, res: '2256 x 1504', touch: true, color: 'Sandstone' },
    { name: 'Microsoft Surface Laptop 5 13.5" (Core i7, 16GB, 512GB)', cat: 'ultrabooks', price: 175000, ram: 16, storage: 512, cpu: 'Intel Core i7-1255U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.5, res: '2256 x 1504', touch: true, color: 'Matte Black', best: true },
    { name: 'Microsoft Surface Laptop 5 15" (Core i7, 16GB, 512GB)', cat: 'ultrabooks', price: 195000, ram: 16, storage: 512, cpu: 'Intel Core i7-1255U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.0, res: '2496 x 1664', touch: true, color: 'Platinum', feat: true },
    { name: 'Microsoft Surface Pro 9 (Core i5, 8GB, 256GB)', cat: '2-in-1-convertibles', price: 130000, ram: 8, storage: 256, cpu: 'Intel Core i5-1235U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.0, res: '2880 x 1920', refresh: 120, touch: true, color: 'Sapphire Blue' },
    { name: 'Microsoft Surface Pro 9 (Core i7, 16GB, 512GB)', cat: '2-in-1-convertibles', price: 185000, ram: 16, storage: 512, cpu: 'Intel Core i7-1255U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 13.0, res: '2880 x 1920', refresh: 120, touch: true, color: 'Forest Green', feat: true },
    { name: 'Microsoft Surface Laptop Studio 2 (Core i7, 16GB, 512GB, RTX 4050)', cat: 'workstations', price: 295000, ram: 16, storage: 512, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 14.4, res: '2400 x 1600', refresh: 120, touch: true, color: 'Platinum', newArr: true },
    { name: 'Microsoft Surface Laptop Studio 2 (Core i7, 32GB, 1TB, RTX 4060)', cat: 'workstations', price: 360000, ram: 32, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4060', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 14.4, res: '2400 x 1600', refresh: 120, touch: true, color: 'Platinum', feat: true },
  ];

  // --- 10. SAMSUNG (8 models: KSh 115,000 to KSh 380,000) ---
  const samsungModels: BrandDefItem[] = [
    { name: 'Samsung Galaxy Book3 (Core i5, 16GB, 512GB)', cat: 'student-laptops', price: 115000, ram: 16, storage: 512, cpu: 'Intel Core i5-1335U', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', color: 'Silver' },
    { name: 'Samsung Galaxy Book3 360 (Core i7, 16GB, 512GB, AMOLED)', cat: '2-in-1-convertibles', price: 155000, ram: 16, storage: 512, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 15.6, res: '1920 x 1080', touch: true, color: 'Graphite', best: true },
    { name: 'Samsung Galaxy Book3 Pro 14" (Core i7, 16GB, 512GB, 3K AMOLED)', cat: 'ultrabooks', price: 175000, ram: 16, storage: 512, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 120, color: 'Moonstone Gray', feat: true },
    { name: 'Samsung Galaxy Book3 Pro 16" (Core i7, 16GB, 1TB, 3K AMOLED)', cat: 'ultrabooks', price: 210000, ram: 16, storage: 1000, cpu: 'Intel Core i7-1360P', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Iris Xe', gpuBrand: GPUBrand.INTEL, size: 16.0, res: '2880 x 1800', refresh: 120, color: 'Graphite' },
    { name: 'Samsung Galaxy Book3 Ultra (Core i7, 16GB, 1TB, RTX 4050)', cat: 'workstations', price: 265000, ram: 16, storage: 1000, cpu: 'Intel Core i7-13700H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4050', gpuBrand: GPUBrand.NVIDIA, gpuMem: 6, size: 16.0, res: '2880 x 1800', refresh: 120, color: 'Graphite', feat: true },
    { name: 'Samsung Galaxy Book3 Ultra (Core i9, 32GB, 1TB, RTX 4070)', cat: 'workstations', price: 340000, ram: 32, storage: 1000, cpu: 'Intel Core i9-13900H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2880 x 1800', refresh: 120, color: 'Graphite' },
    { name: 'Samsung Galaxy Book4 Pro 14" (Intel Ultra 7, 16GB, 512GB, AMOLED)', cat: 'ultrabooks', price: 215000, ram: 16, storage: 512, cpu: 'Intel Core Ultra 7 155H', cpuBrand: ProcessorBrand.INTEL, gpu: 'Intel Arc Graphics', gpuBrand: GPUBrand.INTEL, size: 14.0, res: '2880 x 1800', refresh: 120, touch: true, color: 'Moonstone Gray', newArr: true, feat: true },
    { name: 'Samsung Galaxy Book4 Ultra (Intel Ultra 9, 32GB, 1TB, RTX 4070)', cat: 'workstations', price: 380000, ram: 32, storage: 1000, cpu: 'Intel Core Ultra 9 185H', cpuBrand: ProcessorBrand.INTEL, gpu: 'NVIDIA GeForce RTX 4070', gpuBrand: GPUBrand.NVIDIA, gpuMem: 8, size: 16.0, res: '2880 x 1800', refresh: 120, touch: true, color: 'Moonstone Gray', newArr: true, feat: true },
  ];

  // Helper function to register laptop groups
  function registerBrandLaptops(brandSlug: string, items: BrandDefItem[], codePrefix: string) {
    items.forEach((m, idx) => {
      const pad = String(idx + 1).padStart(3, '0');
      const sku = `${codePrefix}-${pad}`;
      const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const discount = Math.floor(Math.random() * 12) + 3; // 3% to 15% discount
      const compareAtPrice = Math.round(m.price * (1 + discount / 100));

      rawLaptops.push({
        brandSlug,
        categorySlug: m.cat,
        sku,
        name: m.name,
        slug,
        description: `Experience exceptional computing performance with the ${m.name}. Features high-performance ${m.cpu}, vivid ${m.size}-inch display, and advanced thermal management tailored for demanding workflows.`,
        shortDescription: `${m.cpu}, ${m.ram}GB RAM, ${m.storage}GB SSD, ${m.gpu || 'Integrated Graphics'}`,
        price: m.price,
        compareAtPrice,
        discount,
        stock: Math.floor(Math.random() * 30) + 8,
        processor: m.cpu,
        processorBrand: m.cpuBrand,
        ram: m.ram,
        ramType: m.ram >= 32 || m.cpu.includes('Ultra') ? 'DDR5' : 'DDR4',
        storage: m.storage,
        storageType: 'SSD',
        gpu: m.gpu,
        gpuBrand: m.gpuBrand,
        gpuMemory: m.gpuMem || 0,
        displaySize: m.size,
        displayResolution: m.res,
        displayType: m.name.toLowerCase().includes('oled') || m.name.toLowerCase().includes('amoled') ? 'OLED' : 'IPS',
        refreshRate: m.refresh || 60,
        touchscreen: !!m.touch,
        color: m.color,
        batteryLife: m.cat === 'gaming-laptops' ? 'Up to 5 hours' : 'Up to 12 hours',
        os: OperatingSystem.WINDOWS_11,
        weight: m.cat === 'gaming-laptops' ? 2.4 : 1.4,
        isFeatured: !!m.feat,
        isNewArrival: !!m.newArr,
        isBestSeller: !!m.best,
      });
    });
  }

  registerBrandLaptops('dell', dellModels, 'DEL');
  registerBrandLaptops('hp', hpModels, 'HP');
  registerBrandLaptops('lenovo', lenovoModels, 'LEN');
  registerBrandLaptops('asus', asusModels, 'ASU');
  registerBrandLaptops('acer', acerModels, 'ACE');
  registerBrandLaptops('msi', msiModels, 'MSI');
  registerBrandLaptops('razer', razerModels, 'RAZ');
  registerBrandLaptops('microsoft', microsoftModels, 'MSF');
  registerBrandLaptops('samsung', samsungModels, 'SAM');

  console.log(`📦 Prepared ${rawLaptops.length} distinct laptop models for seeding.`);

  // Insert all laptops & their images into Database
  let count = 0;
  for (const item of rawLaptops) {
    count++;
    const brandId = brandMap[item.brandSlug];
    const categoryId = categoryMap[item.categorySlug];

    const product = await prisma.product.create({
      data: {
        sku: item.sku,
        name: item.name,
        slug: `${item.slug}-${count}`,
        description: item.description,
        shortDescription: item.shortDescription,
        brandId,
        categoryId,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        discount: item.discount,
        stock: item.stock,
        processor: item.processor,
        processorBrand: item.processorBrand,
        ram: item.ram,
        ramType: item.ramType,
        storage: item.storage,
        storageType: item.storageType,
        gpu: item.gpu,
        gpuBrand: item.gpuBrand,
        gpuMemory: item.gpuMemory,
        displaySize: item.displaySize,
        displayResolution: item.displayResolution,
        displayType: item.displayType,
        refreshRate: item.refreshRate,
        touchscreen: item.touchscreen || false,
        color: item.color,
        batteryLife: item.batteryLife,
        os: item.os,
        weight: item.weight,
        isFeatured: item.isFeatured || false,
        isNewArrival: item.isNewArrival || false,
        isBestSeller: item.isBestSeller || false,
        highlights: JSON.stringify([
          `${item.processor} High-Performance Processor`,
          `${item.ram}GB RAM & ${item.storage}GB High-Speed NVMe SSD`,
          `${item.displaySize}" ${item.displayType} Display (${item.displayResolution})`,
          item.gpu ? `Graphics: ${item.gpu}` : 'Ultra-thin portable design',
          `Genuine ${item.os.replace('_', ' ')} Pre-installed`,
        ]),
      },
    });

    // Pick 3-4 images for this product from the brand's gallery
    const brandImages = laptopImageGalleries[item.brandSlug] || laptopImageGalleries.dell;
    // Rotate offset to give each laptop a distinct lead photo
    const offset = (count - 1) % brandImages.length;
    const reorderedImages = [
      brandImages[offset],
      brandImages[(offset + 1) % brandImages.length],
      brandImages[(offset + 2) % brandImages.length],
      brandImages[(offset + 3) % brandImages.length],
    ];

    for (let i = 0; i < reorderedImages.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: reorderedImages[i],
          alt: `${product.name} - View ${i + 1}`,
          order: i,
          isMain: i === 0,
        },
      });
    }

    if (count % 25 === 0 || count === rawLaptops.length) {
      console.log(`  -> Inserted ${count}/${rawLaptops.length} laptops...`);
    }
  }

  console.log(`✅ Successfully inserted all ${count} laptops with high-definition multi-angle images!`);

  // 6. Create Coupons in Kenyan Shillings (KES)
  await prisma.coupon.create({
    data: {
      code: 'KARIBU10',
      description: '10% discount for first-time shoppers on orders over KSh 50,000',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 50000,
      maxDiscount: 20000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'APEX5000',
      description: 'KSh 5,000 instant discount on premium laptops over KSh 100,000',
      type: 'FIXED_AMOUNT',
      value: 5000,
      minPurchase: 100000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  });

  console.log('✅ Coupons created in KES');
  console.log('🎉 Database seeded successfully with 125 laptops in Kenyan Shillings (KES)!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
