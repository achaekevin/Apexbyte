const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBlogs() {
  console.log('Seeding blog categories and posts...');

  // 1. Get or create an admin user for authorId
  let admin = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
  });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }
  const authorId = admin ? admin.id : null;

  // 2. Categories
  const categoryDefs = [
    {
      name: 'Buying Guides',
      slug: 'buying-guides',
      description: 'Expert recommendations to help you choose the right laptop.',
    },
    {
      name: 'Laptop Reviews',
      slug: 'laptop-reviews',
      description: 'In-depth hands-on reviews of the latest models.',
    },
    {
      name: 'Tech Tips & Care',
      slug: 'tech-tips',
      description: 'Practical maintenance advice, battery optimization, and guides.',
    },
    {
      name: 'Gaming & Performance',
      slug: 'gaming-performance',
      description: 'Benchmarks, high-end GPUs, and esports hardware coverage.',
    },
  ];

  const catMap = {};
  for (const c of categoryDefs) {
    let cat = await prisma.blogCategory.findFirst({ where: { slug: c.slug } });
    if (!cat) {
      cat = await prisma.blogCategory.create({ data: c });
    }
    catMap[c.slug] = cat.id;
  }

  // 3. Posts
  const postDefs = [
    {
      title: 'Best Laptops for Developers and Students in Kenya (2026 Buying Guide)',
      slug: 'best-laptops-developers-students-kenya-2026',
      excerpt: 'Looking for the ideal laptop to handle programming, office productivity, and student coursework? Here is our comprehensive comparison of top performers available today.',
      content: `## Finding the Perfect Balance

Choosing a laptop for computer science, software engineering, or demanding coursework can be overwhelming. You need a device that compiles code quickly, multitasks across Docker containers and multiple browser tabs, and still maintains enough battery life for lectures and coffee shop work sessions.

### Recommended Minimum Specifications for 2026:
- **Processor**: Intel Core i5 / AMD Ryzen 5 (12th Gen or newer) or Apple M2/M3.
- **RAM**: 16GB is the modern sweet spot. 8GB is sufficient for basic browsing, but developer tools quickly eat through memory.
- **Storage**: Minimum 512GB NVMe SSD for fast boot times and instant project loading.
- **Display**: 14" to 15.6" Full HD (1080p) or higher with anti-glare coating for comfortable all-day viewing.

### Top Recommendations
1. **Dell Vostro & Inspiron Series**: Built for rugged daily usage with readily available replacement parts and robust customer support.
2. **HP Pavilion & Envy**: Sleek aluminum chassis, crisp sound systems, and competitive pricing for university students.
3. **Lenovo ThinkPad**: Legendary keyboards, spill resistance, and proven reliability for professional programmers.`,
      featuredImage: '/laptops/hp-pavilion-natural.jpg',
      categoryId: catMap['buying-guides'],
      authorId,
      status: 'PUBLISHED',
      viewCount: 342,
      metaTitle: 'Best Laptops for Developers & Students in Kenya',
      metaDescription: 'Find the best laptops in Kenya for programming and university work.',
      keywords: 'laptops kenya, best student laptops, programming laptop',
    },
    {
      title: 'Intel Core Ultra vs AMD Ryzen 8000 vs Apple Silicon: Which CPU Fits Your Workflow?',
      slug: 'intel-core-ultra-vs-amd-ryzen-vs-apple-silicon',
      excerpt: 'A deep dive into modern laptop processors. Learn which chip architecture delivers the best battery endurance and raw multi-threaded throughput.',
      content: `## The Modern Processor Landscape

Laptop CPUs have advanced tremendously over the last two years. With dedicated Neural Processing Units (NPUs) and hybrid architecture with Performance and Efficiency cores, buying a laptop is no longer just about clock speed.

### Intel Core Ultra (Series 1 & 2)
Intel's latest Core Ultra lineup integrates efficient ARC graphics and an on-die NPU for local AI tasks. They excel at multi-core tasks, video compression, and broad compatibility with enterprise legacy software.

### AMD Ryzen 8000 & AI 300
AMD continues to dominate power efficiency in Windows laptops. The integrated Radeon 780M and 890M GPUs deliver console-class gaming performance on thin ultrabooks without dedicated graphics cards.

### Apple Silicon (M2 / M3 / M4)
For UNIX terminal workflows, Xcode iOS compilation, and exceptional battery runtime (often reaching 15-18 hours of real use), Apple Silicon remains unmatched in raw efficiency per watt.`,
      featuredImage: '/laptops/macbook-pro-natural.jpg',
      categoryId: catMap['tech-tips'],
      authorId,
      status: 'PUBLISHED',
      viewCount: 512,
      metaTitle: 'Intel Core Ultra vs AMD Ryzen vs Apple Silicon',
      metaDescription: 'Compare top laptop processor architectures in 2026.',
      keywords: 'cpu comparison, intel core ultra, amd ryzen, apple silicon',
    },
    {
      title: 'How to Extend Your Laptop\'s Battery Health and Longevity',
      slug: 'how-to-extend-laptop-battery-health-longevity',
      excerpt: 'Simple charging habits and operating system power configurations that prevent premature battery degradation and keep your machine running longer.',
      content: `## Why Laptop Batteries Degrade

Lithium-ion batteries naturally lose chemical capacity over time. However, excessive heat and constantly holding a 100% state of charge under high temperatures will degrade battery lifespan rapidly.

### 5 Proven Tips to Double Battery Lifespan
1. **Enable Battery Threshold Limiting**: Modern Dell, Lenovo, and ASUS laptops offer utility software (such as Dell Power Manager or Lenovo Vantage) allowing you to cap charging at 80%. This can double the lifespan of your battery cells.
2. **Avoid Soft Surfaces**: Using your laptop on beds or blankets blocks intake vents, raising internal temperatures to 85°C+ and degrading battery health.
3. **Use the Correct Power Adapter**: Always use OEM chargers or certified USB-PD 65W/100W GaN adapters that properly regulate voltage.
4. **Calibrate Once Every 3 Months**: Discharge to 10% and recharge uninterrupted to 100% to keep Windows/macOS percentage readings accurate.`,
      featuredImage: '/laptops/lenovo-thinkpad-natural.jpg',
      categoryId: catMap['tech-tips'],
      authorId,
      status: 'PUBLISHED',
      viewCount: 289,
      metaTitle: 'How to Extend Laptop Battery Life & Health',
      metaDescription: 'Practical ways to preserve laptop battery health for years.',
      keywords: 'laptop battery care, extend battery life, charge threshold',
    },
    {
      title: 'Lenovo ThinkPad X1 Carbon: The Benchmark of Business Ultrabooks',
      slug: 'lenovo-thinkpad-x1-carbon-review',
      excerpt: 'Our in-depth hands-on review of the ThinkPad X1 Carbon. Exceptional keyboard tactility, legendary carbon-fiber build, and enterprise reliability.',
      content: `## The Gold Standard in Professional Computing

For over three decades, the ThinkPad brand has been the standard bearer in enterprise IT. The X1 Carbon takes that heritage and packs it into a sub-1.1kg chassis crafted from carbon fiber and magnesium alloy.

### What We Love:
- **The Keyboard**: The deep 1.5mm key travel, cupped keycaps, and tactile actuation make typing thousands of words a pleasure.
- **Durability**: MIL-STD-810H tested against shock, drops, humidity, and extreme temperatures.
- **Port Selection**: Dual Thunderbolt 4 ports, dual USB-A 3.2 ports, HDMI 2.1, and an audio jack—no dongles required!

### Verdict
If you are an accountant, legal professional, software engineer, or executive who values reliability and ergonomic typing above all else, the ThinkPad X1 Carbon remains undefeated.`,
      featuredImage: '/laptops/lenovo-thinkpad-natural.jpg',
      categoryId: catMap['laptop-reviews'],
      authorId,
      status: 'PUBLISHED',
      viewCount: 420,
      metaTitle: 'Lenovo ThinkPad X1 Carbon Hands-on Review',
      metaDescription: 'Comprehensive review of the legendary business ultrabook.',
      keywords: 'thinkpad review, x1 carbon, best business laptop',
    },
    {
      title: 'Top Gaming Laptops in 2026: RTX 40-Series Performance Tested',
      slug: 'top-gaming-laptops-2026-rtx-tested',
      excerpt: 'From budget esports performers to ultra-high-end desktop replacements, here is what you need to know about modern GPU wattage and cooling.',
      content: `## What Truly Matters in Gaming Laptops

A high GPU model number on paper does not always equate to top frame rates. Total Graphics Power (TGP) and thermal design determine whether your RTX 4060 or 4070 runs at full throttle or throttles under heavy load.

### Key Factors to Check:
- **TGP (Total Graphics Power)**: Ensure your chosen RTX 4060/4070 laptop delivers at least 100W–140W for maximum performance.
- **Display Refresh Rate & Response Time**: Look for at least 144Hz with 100% sRGB and support for NVIDIA G-Sync or AMD FreeSync to eliminate tearing.
- **Mux Switch & Advanced Optimus**: Allows the dedicated GPU to bypass the integrated graphics directly to the screen for a 10-15% FPS boost.`,
      featuredImage: '/laptops/asus-rog-natural.jpg',
      categoryId: catMap['gaming-performance'],
      authorId,
      status: 'PUBLISHED',
      viewCount: 615,
      metaTitle: 'Top Gaming Laptops with RTX 40-Series Tested',
      metaDescription: 'Performance analysis and buying advice for gaming laptops in 2026.',
      keywords: 'gaming laptops, rtx 4060 laptop, asus rog, gaming fps',
    },
  ];

  let added = 0;
  for (const p of postDefs) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.blogPost.create({ data: p });
      added++;
    }
  }

  console.log('Seeding complete! Added', added, 'blog posts.');
}

seedBlogs().catch(console.error).finally(() => prisma.$disconnect());
