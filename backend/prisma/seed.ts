import { PrismaClient, UserRole, ProcessorBrand, GPUBrand, OperatingSystem } from '@prisma/client';
import { hashPassword } from '../src/utils/helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
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
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // Create Admin User
  const adminPassword = await hashPassword('Admin@12345');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@laptopstore.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
    },
  });

  // Create Test Customer
  const customerPassword = await hashPassword('Customer@123');
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      isVerified: true,
    },
  });

  console.log('✅ Users created');

  // Create Brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Apple',
        slug: 'apple',
        description: 'Premium laptops with M-series chips',
        logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200',
        order: 1,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Dell',
        slug: 'dell',
        description: 'Business and gaming laptops',
        logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
        order: 2,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'HP',
        slug: 'hp',
        description: 'Versatile laptops for every need',
        logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200',
        order: 3,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Lenovo',
        slug: 'lenovo',
        description: 'ThinkPad and IdeaPad series',
        logo: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200',
        order: 4,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'ASUS',
        slug: 'asus',
        description: 'Gaming and professional laptops',
        logo: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200',
        order: 5,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'MSI',
        slug: 'msi',
        description: 'High-performance gaming laptops',
        logo: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200',
        order: 6,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Razer',
        slug: 'razer',
        description: 'Premium gaming laptops',
        logo: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=200',
        order: 7,
      },
    }),
  ]);

  console.log('✅ Brands created');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Gaming Laptops',
        slug: 'gaming-laptops',
        description: 'High-performance laptops for gaming',
        icon: '🎮',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business Laptops',
        slug: 'business-laptops',
        description: 'Professional laptops for work',
        icon: '💼',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Student Laptops',
        slug: 'student-laptops',
        description: 'Affordable laptops for students',
        icon: '🎓',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Ultrabooks',
        slug: 'ultrabooks',
        description: 'Thin and light premium laptops',
        icon: '✨',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Workstations',
        slug: 'workstations',
        description: 'Powerful laptops for creators',
        icon: '🎨',
        order: 5,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create Products - Realistic Laptops
  const products = [
    // Apple MacBooks
    {
      sku: 'APL-MBP-M3-001',
      name: 'MacBook Pro 14" M3',
      slug: 'macbook-pro-14-m3',
      description: 'The new MacBook Pro with M3 chip delivers exceptional performance for professionals.',
      shortDescription: 'Professional laptop with M3 chip',
      brandId: brands[0].id,
      categoryId: categories[3].id,
      price: 1999,
      compareAtPrice: 2199,
      discount: 9,
      stock: 50,
      processor: 'Apple M3',
      processorBrand: ProcessorBrand.APPLE,
      processorGen: 'M3',
      ram: 16,
      ramType: 'Unified Memory',
      storage: 512,
      storageType: 'SSD',
      gpu: 'Apple M3 GPU',
      gpuBrand: GPUBrand.APPLE,
      gpuMemory: 16,
      displaySize: 14.2,
      displayResolution: '3024 x 1964',
      displayType: 'Liquid Retina XDR',
      refreshRate: 120,
      color: 'Space Gray',
      batteryLife: 'Up to 18 hours',
      os: OperatingSystem.MACOS,
      weight: 1.55,
      isFeatured: true,
      isNewArrival: true,
      highlights: JSON.stringify([
        'M3 chip for incredible performance',
        'Liquid Retina XDR display',
        'Up to 18 hours battery life',
        'Three Thunderbolt 4 ports',
      ]),
    },
    {
      sku: 'APL-MBA-M2-001',
      name: 'MacBook Air 13" M2',
      slug: 'macbook-air-13-m2',
      description: 'Remarkably thin and light with the powerful M2 chip.',
      shortDescription: 'Ultra-portable with M2 chip',
      brandId: brands[0].id,
      categoryId: categories[3].id,
      price: 1199,
      compareAtPrice: 1299,
      discount: 8,
      stock: 75,
      processor: 'Apple M2',
      processorBrand: ProcessorBrand.APPLE,
      processorGen: 'M2',
      ram: 8,
      ramType: 'Unified Memory',
      storage: 256,
      storageType: 'SSD',
      gpu: 'Apple M2 GPU',
      gpuBrand: GPUBrand.APPLE,
      displaySize: 13.6,
      displayResolution: '2560 x 1664',
      refreshRate: 60,
      color: 'Midnight',
      batteryLife: 'Up to 18 hours',
      os: OperatingSystem.MACOS,
      weight: 1.24,
      isFeatured: true,
    },
    // Dell Gaming & Business
    {
      sku: 'DEL-XPS-001',
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Premium laptop with stunning display and powerful performance.',
      shortDescription: 'Premium performance laptop',
      brandId: brands[1].id,
      categoryId: categories[1].id,
      price: 1799,
      stock: 40,
      processor: 'Intel Core i7-13700H',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 16,
      ramType: 'DDR5',
      storage: 512,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4050',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 6,
      displaySize: 15.6,
      displayResolution: '1920 x 1080',
      displayType: 'IPS',
      refreshRate: 60,
      color: 'Platinum Silver',
      batteryLife: 'Up to 12 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
    },
    {
      sku: 'DEL-G15-001',
      name: 'Dell G15 Gaming Laptop',
      slug: 'dell-g15-gaming',
      description: 'Powerful gaming laptop with RTX graphics.',
      shortDescription: 'Gaming laptop with RTX graphics',
      brandId: brands[1].id,
      categoryId: categories[0].id,
      price: 1299,
      stock: 60,
      processor: 'Intel Core i7-12700H',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '12th Gen',
      ram: 16,
      ramType: 'DDR5',
      storage: 1000,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4060',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 8,
      displaySize: 15.6,
      displayResolution: '1920 x 1080',
      refreshRate: 165,
      color: 'Dark Shadow Grey',
      batteryLife: 'Up to 6 hours',
      os: OperatingSystem.WINDOWS_11,
      isBestSeller: true,
    },
    // HP Laptops
    {
      sku: 'HP-SPEC-001',
      name: 'HP Spectre x360 14',
      slug: 'hp-spectre-x360-14',
      description: '2-in-1 convertible laptop with stunning design.',
      shortDescription: '2-in-1 convertible premium laptop',
      brandId: brands[2].id,
      categoryId: categories[3].id,
      price: 1599,
      stock: 35,
      processor: 'Intel Core i7-1355U',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 16,
      ramType: 'LPDDR4x',
      storage: 512,
      storageType: 'SSD',
      gpu: 'Intel Iris Xe',
      gpuBrand: GPUBrand.INTEL,
      displaySize: 13.5,
      displayResolution: '1920 x 1280',
      displayType: 'OLED',
      touchscreen: true,
      refreshRate: 60,
      color: 'Nightfall Black',
      batteryLife: 'Up to 11 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
    },
    {
      sku: 'HP-PAV-001',
      name: 'HP Pavilion 15',
      slug: 'hp-pavilion-15',
      description: 'Versatile laptop for everyday computing.',
      shortDescription: 'Everyday laptop for students',
      brandId: brands[2].id,
      categoryId: categories[2].id,
      price: 749,
      stock: 100,
      processor: 'AMD Ryzen 5 5500U',
      processorBrand: ProcessorBrand.AMD,
      processorGen: '5000 Series',
      ram: 8,
      ramType: 'DDR4',
      storage: 256,
      storageType: 'SSD',
      gpu: 'AMD Radeon Graphics',
      gpuBrand: GPUBrand.AMD,
      displaySize: 15.6,
      displayResolution: '1920 x 1080',
      refreshRate: 60,
      color: 'Natural Silver',
      batteryLife: 'Up to 8 hours',
      os: OperatingSystem.WINDOWS_11,
      isBestSeller: true,
    },
    // Lenovo ThinkPad & Legion
    {
      sku: 'LEN-TP-001',
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      slug: 'thinkpad-x1-carbon-gen-11',
      description: 'Ultra-light business laptop with legendary ThinkPad quality.',
      shortDescription: 'Premium business ultrabook',
      brandId: brands[3].id,
      categoryId: categories[1].id,
      price: 1899,
      stock: 45,
      processor: 'Intel Core i7-1365U',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 16,
      ramType: 'LPDDR5',
      storage: 512,
      storageType: 'SSD',
      gpu: 'Intel Iris Xe',
      gpuBrand: GPUBrand.INTEL,
      displaySize: 14,
      displayResolution: '1920 x 1200',
      displayType: 'IPS',
      refreshRate: 60,
      color: 'Black',
      batteryLife: 'Up to 15 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
    },
    {
      sku: 'LEN-LEG-001',
      name: 'Lenovo Legion 5 Pro',
      slug: 'lenovo-legion-5-pro',
      description: 'High-performance gaming laptop with QHD display.',
      shortDescription: 'Gaming powerhouse',
      brandId: brands[3].id,
      categoryId: categories[0].id,
      price: 1699,
      stock: 55,
      processor: 'AMD Ryzen 7 7735HS',
      processorBrand: ProcessorBrand.AMD,
      processorGen: '7000 Series',
      ram: 16,
      ramType: 'DDR5',
      storage: 1000,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4070',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 8,
      displaySize: 16,
      displayResolution: '2560 x 1600',
      refreshRate: 165,
      color: 'Storm Grey',
      batteryLife: 'Up to 5 hours',
      os: OperatingSystem.WINDOWS_11,
      isBestSeller: true,
      isNewArrival: true,
    },
    // ASUS ROG & ZenBook
    {
      sku: 'ASU-ROG-001',
      name: 'ASUS ROG Zephyrus G14',
      slug: 'asus-rog-zephyrus-g14',
      description: 'Compact gaming laptop with AMD Ryzen power.',
      shortDescription: 'Compact gaming powerhouse',
      brandId: brands[4].id,
      categoryId: categories[0].id,
      price: 1799,
      stock: 40,
      processor: 'AMD Ryzen 9 7940HS',
      processorBrand: ProcessorBrand.AMD,
      processorGen: '7000 Series',
      ram: 16,
      ramType: 'DDR5',
      storage: 1000,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4060',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 8,
      displaySize: 14,
      displayResolution: '2560 x 1600',
      refreshRate: 165,
      color: 'Moonlight White',
      batteryLife: 'Up to 10 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
      isNewArrival: true,
    },
    {
      sku: 'ASU-ZEN-001',
      name: 'ASUS ZenBook 14 OLED',
      slug: 'asus-zenbook-14-oled',
      description: 'Premium ultrabook with stunning OLED display.',
      shortDescription: 'Premium OLED ultrabook',
      brandId: brands[4].id,
      categoryId: categories[3].id,
      price: 1099,
      stock: 65,
      processor: 'Intel Core i7-1355U',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 16,
      ramType: 'LPDDR5',
      storage: 512,
      storageType: 'SSD',
      gpu: 'Intel Iris Xe',
      gpuBrand: GPUBrand.INTEL,
      displaySize: 14,
      displayResolution: '2880 x 1800',
      displayType: 'OLED',
      refreshRate: 90,
      color: 'Ponder Blue',
      batteryLife: 'Up to 13 hours',
      os: OperatingSystem.WINDOWS_11,
    },
    // MSI Gaming
    {
      sku: 'MSI-RAI-001',
      name: 'MSI Raider GE78 HX',
      slug: 'msi-raider-ge78-hx',
      description: 'Ultimate gaming laptop with RTX 4090.',
      shortDescription: 'Ultimate gaming machine',
      brandId: brands[5].id,
      categoryId: categories[0].id,
      price: 3499,
      stock: 15,
      processor: 'Intel Core i9-13980HX',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 32,
      ramType: 'DDR5',
      storage: 2000,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4090',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 16,
      displaySize: 17,
      displayResolution: '2560 x 1600',
      refreshRate: 240,
      color: 'Core Black',
      batteryLife: 'Up to 4 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
    },
    // Razer
    {
      sku: 'RAZ-BLA-001',
      name: 'Razer Blade 15',
      slug: 'razer-blade-15',
      description: 'Premium gaming laptop with sleek design.',
      shortDescription: 'Premium gaming design',
      brandId: brands[6].id,
      categoryId: categories[0].id,
      price: 2499,
      stock: 25,
      processor: 'Intel Core i7-13800H',
      processorBrand: ProcessorBrand.INTEL,
      processorGen: '13th Gen',
      ram: 16,
      ramType: 'DDR5',
      storage: 1000,
      storageType: 'SSD',
      gpu: 'NVIDIA GeForce RTX 4070',
      gpuBrand: GPUBrand.NVIDIA,
      gpuMemory: 8,
      displaySize: 15.6,
      displayResolution: '2560 x 1440',
      refreshRate: 240,
      color: 'Black',
      batteryLife: 'Up to 6 hours',
      os: OperatingSystem.WINDOWS_11,
      isFeatured: true,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Add product images
    const imageUrls = [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    ];

    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrls[i],
          alt: product.name,
          order: i,
          isMain: i === 0,
        },
      });
    }
  }

  console.log('✅ Products created with images');

  // Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% off for new customers',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SAVE50',
      description: '$50 off on orders over $1000',
      type: 'FIXED_AMOUNT',
      value: 50,
      minPurchase: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  });

  console.log('✅ Coupons created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
