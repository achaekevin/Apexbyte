import prisma from '../src/config/database';
import { OperatingSystem, ProcessorBrand, GPUBrand } from '@prisma/client';

const NATURAL_BRAND_IMAGES: Record<string, string[]> = {
  dell: [
    '/laptops/dell-vostro-natural.png',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
  ],
  apple: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
  ],
  hp: [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
  ],
  lenovo: [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  ],
  asus: [
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
  ],
  acer: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=800',
  ],
  msi: [
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
  ],
  razer: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
  ],
  microsoft: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1575024357670-2b5164f470c3?w=800',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
  ],
  samsung: [
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800',
  ],
};

async function updateLaptopImages() {
  console.log('🔄 Starting update of laptop images to natural authentic photography...');

  // 1. First ensure Dell Vostro 14 exists in database
  const dellBrand = await prisma.brand.findUnique({ where: { slug: 'dell' } });
  const studentCategory = await prisma.category.findUnique({ where: { slug: 'student-laptops' } }) 
    || await prisma.category.findFirst();

  if (dellBrand && studentCategory) {
    const vostroSlug = 'dell-vostro-14-core-i5-11th-gen-8gb-512gb';
    const existingVostro = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: vostroSlug },
          { name: { contains: 'Vostro 14' } }
        ]
      }
    });

    if (!existingVostro) {
      console.log('Creating Dell Vostro 14 with natural photo...');
      const createdVostro = await prisma.product.create({
        data: {
          name: 'Dell Vostro 14 (Core i5 11th Gen, 8GB, 512GB SSD)',
          slug: vostroSlug,
          sku: 'DEL-VOSTRO-14-I5-512',
          brandId: dellBrand.id,
          categoryId: studentCategory.id,
          price: 54000,
          compareAtPrice: 62000,
          discount: 13,
          stock: 12,
          processor: 'Intel Core i5-1135G7',
          processorBrand: ProcessorBrand.INTEL,
          processorGen: '11th Generation',
          ram: 8,
          ramType: 'DDR4',
          storage: 512,
          storageType: 'SSD NVMe',
          gpu: 'Intel Iris Xe Graphics',
          gpuBrand: GPUBrand.INTEL,
          displaySize: 14.0,
          displayResolution: '1920 x 1080',
          displayType: 'FHD Anti-glare',
          refreshRate: 60,
          color: 'Carbon Gray',
          batteryLife: 'Up to 9 hours',
          os: OperatingSystem.WINDOWS_11,
          description: 'Dell Vostro 14 with Intel Core i5 11th generation, 8GB RAM, and 512GB SSD. Premium build with ergonomic hinge, crisp FHD display, and all-day battery life.',
          shortDescription: 'Core i5 11th Gen | 8GB RAM | 512GB SSD | 14" FHD',
          isFeatured: true,
          isBestSeller: true,
          isNewArrival: true,
        },
      });

      await prisma.productImage.createMany({
        data: [
          {
            productId: createdVostro.id,
            url: '/laptops/dell-vostro-natural.png',
            alt: 'Dell Vostro 14 Natural Photo',
            order: 0,
            isMain: true,
          },
          {
            productId: createdVostro.id,
            url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
            alt: 'Dell Vostro Workspace',
            order: 1,
            isMain: false,
          },
        ]
      });
      console.log('✅ Created Dell Vostro 14 successfully!');
    } else {
      console.log('Dell Vostro 14 exists, updating image to natural photo...');
      // Clear old images
      await prisma.productImage.deleteMany({ where: { productId: existingVostro.id } });
      await prisma.productImage.createMany({
        data: [
          {
            productId: existingVostro.id,
            url: '/laptops/dell-vostro-natural.png',
            alt: 'Dell Vostro 14 Natural Photo',
            order: 0,
            isMain: true,
          },
          {
            productId: existingVostro.id,
            url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
            alt: 'Dell Vostro Workspace',
            order: 1,
            isMain: false,
          },
        ]
      });
      console.log('✅ Updated Dell Vostro 14 with natural photo!');
    }
  }

  // 2. Fetch all products and replace non-natural images
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      images: { orderBy: { order: 'asc' } }
    }
  });

  console.log(`Found ${products.length} products to check and update images.`);

  let updatedCount = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const brandSlug = product.brand?.slug?.toLowerCase() || 'dell';
    const naturalPool = NATURAL_BRAND_IMAGES[brandSlug] || NATURAL_BRAND_IMAGES.dell;

    let newUrls: string[];
    if (product.name.includes('Vostro') || product.slug.includes('vostro')) {
      newUrls = [
        '/laptops/dell-vostro-natural.png',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
        'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800',
      ];
    } else {
      const img1 = naturalPool[i % naturalPool.length];
      const img2 = naturalPool[(i + 1) % naturalPool.length];
      const img3 = naturalPool[(i + 2) % naturalPool.length];
      newUrls = [img1, img2, img3].filter(Boolean);
    }

    // Delete existing product images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });

    // Create new natural images
    await prisma.productImage.createMany({
      data: newUrls.map((url, idx) => ({
        productId: product.id,
        url,
        alt: `${product.name} - View ${idx + 1}`,
        order: idx,
        isMain: idx === 0,
      }))
    });

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} products with natural, real-life photography!`);
}

updateLaptopImages()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error updating images:', err);
    process.exit(1);
  });
