'use server'

import { db } from "@/lib/db";

const USER_ID = "cmoo83mlv0000qwikbuf5d265";

const PUBLIC_PRODUCTS = [
  { title: "Crystal Bracelets", description: "Handcrafted with amethyst, rose quartz & healing stones", longDescription: "Our crystal bracelets are lovingly handcrafted using genuine amethyst, rose quartz, tiger's eye, and other powerful healing stones.", category: "jewelry", image: "/crystalaura/crystal-bracelet.jpg", price: 499 },
  { title: "Healing Spheres", description: "Clear quartz & crystal spheres for meditation", longDescription: "Our crystal spheres are polished from natural clear quartz and other premium stones.", category: "meditation", image: "/crystalaura/healing-sphere.jpg", price: 1299 },
  { title: "Spiritual Pyramids", description: "Orgonite pyramids charged with positive energy", longDescription: "Our orgonite pyramids are handcrafted with a blend of metal shavings, resin, and genuine crystals.", category: "vastu", image: "/crystalaura/spiritual-pyramid.jpg", price: 899 },
  { title: "Energy Stones", description: "Tumbled & polished stones for chakra healing", longDescription: "Our tumbled and polished energy stones are sourced from mines across India, Brazil, and Madagascar.", category: "crystals", image: "/crystalaura/energy-stones.jpg", price: 199 },
  { title: "Mala Prayer Beads", description: "Rudraksha & crystal mala for japa meditation", longDescription: "Traditional 108-bead mala necklaces crafted from genuine Rudraksha seeds and healing crystals.", category: "jewelry", image: "/crystalaura/mala-beads.jpg", price: 699 },
  { title: "Crystal Pendulums", description: "Amethyst & quartz pendulums for divination", longDescription: "Our crystal pendulums are precision-crafted from natural amethyst, clear quartz, and other gemstones.", category: "crystals", image: "/crystalaura/crystal-pendulum.jpg", price: 349 },
  { title: "Amethyst Geodes", description: "Natural geode bookends & display pieces", longDescription: "Stunning natural amethyst geodes sourced from Uruguay and Brazil.", category: "crystals", image: "/crystalaura/crystal-geode.jpg", price: 2499 },
  { title: "Chakra Stone Sets", description: "7 chakra healing stones for energy alignment", longDescription: "Complete set of 7 genuine chakra stones.", category: "crystals", image: "/crystalaura/chakra-set.jpg", price: 599 },
  { title: "Himalayan Salt Lamps", description: "Natural salt lamps for air purification & calm", longDescription: "Hand-carved from pure Himalayan pink salt crystals.", category: "vastu", image: "/crystalaura/salt-lamp.jpg", price: 799 },
  { title: "Selenite Wands", description: "Energy cleansing wands for aura healing", longDescription: "Our selenite wands are polished from natural selenite crystal.", category: "crystals", image: "/crystalaura/crystal-wand.jpg", price: 449 },
  { title: "Crystal Trees", description: "Gemstone bonsai trees for prosperity & Vastu", longDescription: "Beautiful handcrafted gemstone bonsai trees featuring genuine crystal chips wired onto a metal trunk.", category: "vastu", image: "/crystalaura/crystal-tree.jpg", price: 1199 },
  { title: "Sage & Palo Santo", description: "Smudge kits for space cleansing & purification", longDescription: "Premium white sage bundles and Palo Santo sticks sourced sustainably.", category: "meditation", image: "/crystalaura/sage-smudge.jpg", price: 299 },
];

export async function seedPublicProducts() {
    try {
        const userId = USER_ID;

        // Delete existing first
        await db.eCommerceProduct.deleteMany({ where: { userId } });

        const productsToCreate = PUBLIC_PRODUCTS.map((product, index) => ({
            title: product.title,
            description: product.description,
            longDescription: product.longDescription,
            sku: `CA-${index + 1}`.toUpperCase(),
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

        return { success: true, count: created.count, message: `${created.count} products seeded!` };
    } catch (error) {
        console.error("[SEED_PRODUCTS_ERROR]", error);
        return { success: false, message: "Failed to seed products" };
    }
}