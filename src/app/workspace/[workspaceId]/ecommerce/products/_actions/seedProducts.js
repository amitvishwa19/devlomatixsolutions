'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const PUBLIC_PRODUCTS = [
  {
    title: "Crystal Bracelets",
    description: "Handcrafted with amethyst, rose quartz & healing stones",
    longDescription: "Our crystal bracelets are lovingly handcrafted using genuine amethyst, rose quartz, tiger's eye, and other powerful healing stones. Each bracelet is strung on durable elastic cord and energetically cleansed before shipping. Perfect for daily wear and continuous energy alignment.",
    category: "jewelry",
    image: "/crystalaura/crystal-bracelet.jpg",
    price: 499,
  },
  {
    title: "Healing Spheres",
    description: "Clear quartz & crystal spheres for meditation",
    longDescription: "Our crystal spheres are polished from natural clear quartz and other premium stones. Each sphere radiates energy uniformly in all directions, making them ideal for meditation, scrying, and room energy harmonization. Available in multiple sizes from 30mm to 100mm.",
    category: "meditation",
    image: "/crystalaura/healing-sphere.jpg",
    price: 1299,
  },
  {
    title: "Spiritual Pyramids",
    description: "Orgonite pyramids charged with positive energy",
    longDescription: "Our orgonite pyramids are handcrafted with a blend of metal shavings, resin, and genuine crystals. They convert negative energy into positive life force, enhance meditation, and are perfect for Vastu correction. Each pyramid is unique and charged under moonlight.",
    category: "vastu",
    image: "/crystalaura/spiritual-pyramid.jpg",
    price: 899,
  },
  {
    title: "Energy Stones",
    description: "Tumbled & polished stones for chakra healing",
    longDescription: "Our tumbled and polished energy stones are sourced from mines across India, Brazil, and Madagascar. Each stone is carefully selected for its clarity, color, and energetic properties. Use them for chakra healing, crystal grids, or carry them in your pocket for daily protection.",
    category: "crystals",
    image: "/crystalaura/energy-stones.jpg",
    price: 199,
  },
  {
    title: "Mala Prayer Beads",
    description: "Rudraksha & crystal mala for japa meditation",
    longDescription: "Traditional 108-bead mala necklaces crafted from genuine Rudraksha seeds and healing crystals. Perfect for japa meditation, mantra counting, and spiritual practice. Each mala is hand-knotted between beads and features a guru bead for easy counting.",
    category: "jewelry",
    image: "/crystalaura/mala-beads.jpg",
    price: 699,
  },
  {
    title: "Crystal Pendulums",
    description: "Amethyst & quartz pendulums for divination",
    longDescription: "Our crystal pendulums are precision-crafted from natural amethyst, clear quartz, and other gemstones. They are balanced for smooth swinging and come with a silver-plated chain. Ideal for dowsing, divination, chakra balancing, and energy healing work.",
    category: "crystals",
    image: "/crystalaura/crystal-pendulum.jpg",
    price: 349,
  },
  {
    title: "Amethyst Geodes",
    description: "Natural geode bookends & display pieces",
    longDescription: "Stunning natural amethyst geodes sourced from Uruguay and Brazil. Each geode is unique with deep purple crystals formed over millions of years. Available as bookends, cathedral pieces, and tabletop displays. They bring calming energy and are perfect for home or office décor.",
    category: "crystals",
    image: "/crystalaura/crystal-geode.jpg",
    price: 2499,
  },
  {
    title: "Chakra Stone Sets",
    description: "7 chakra healing stones for energy alignment",
    longDescription: "Complete set of 7 genuine chakra stones — Red Jasper, Carnelian, Citrine, Green Aventurine, Lapis Lazuli, Amethyst, and Clear Quartz. Each set comes in a velvet pouch with a chakra guide card. Perfect for energy healing, meditation, and Reiki practice.",
    category: "crystals",
    image: "/crystalaura/chakra-set.jpg",
    price: 599,
  },
  {
    title: "Himalayan Salt Lamps",
    description: "Natural salt lamps for air purification & calm",
    longDescription: "Hand-carved from pure Himalayan pink salt crystals, our salt lamps emit a warm, soothing amber glow. They naturally ionize the air, reduce allergens, and create a calming atmosphere. Each lamp comes with a dimmer switch and wooden base. Available in 2kg to 10kg sizes.",
    category: "vastu",
    image: "/crystalaura/salt-lamp.jpg",
    price: 799,
  },
  {
    title: "Selenite Wands",
    description: "Energy cleansing wands for aura healing",
    longDescription: "Our selenite wands are polished from natural selenite crystal, known for its powerful cleansing and charging properties. Use them to cleanse your aura, charge other crystals, or direct healing energy during meditation. Available in 6-inch and 10-inch lengths.",
    category: "crystals",
    image: "/crystalaura/crystal-wand.jpg",
    price: 449,
  },
  {
    title: "Crystal Trees",
    description: "Gemstone bonsai trees for prosperity & Vastu",
    longDescription: "Beautiful handcrafted gemstone bonsai trees featuring genuine crystal chips wired onto a metal trunk. Available in amethyst, citrine, rose quartz, and multi-stone varieties. They attract prosperity, positive energy, and are excellent Vastu remedies for wealth corners.",
    category: "vastu",
    image: "/crystalaura/crystal-tree.jpg",
    price: 1199,
  },
  {
    title: "Sage & Palo Santo",
    description: "Smudge kits for space cleansing & purification",
    longDescription: "Premium white sage bundles and Palo Santo sticks sourced sustainably. Our smudge kits include everything you need for space cleansing — sage bundle, Palo Santo sticks, an abalone shell, and a feather. Perfect for clearing negative energy from your home or workspace.",
    category: "meditation",
    image: "/crystalaura/sage-smudge.jpg",
    price: 299,
  },
];

export async function seedPublicProducts(userId) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const productsToCreate = PUBLIC_PRODUCTS.map((product, index) => ({
            title: product.title,
            description: product.description,
            longDescription: product.longDescription,
            sku: `CRYSTAL-${index + 1}`,
            price: product.price + Math.floor(Math.random() * 500),
            discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
            inventoryCount: Math.floor(Math.random() * 50) + 10,
            status: "active",
            imageUrl: product.image,
            userId: userId,
            metadata: {
                category: product.category,
                longDescription: product.longDescription
            }
        }));

        const created = await db.eCommerceProduct.createMany({
            data: productsToCreate
        });

        return { success: true, count: created.count };
    } catch (error) {
        console.error("[SEED_PRODUCTS_ERROR]", error);
        return { success: false, message: "Failed to seed products" };
    }
}