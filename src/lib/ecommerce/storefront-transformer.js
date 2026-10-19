/**
 * Formats a database ECommerceProduct record into a clean, frontend-ready
 * product structure compatible with CrystalAura's UI components.
 *
 * @param {object} prod - Prisma product object with variants and reviews included
 * @returns {object} Formatted product object
 */
export function formatStorefrontProduct(prod) {
    if (!prod) return null;

    const reviewCount = prod.reviews?.length || 0;
    const avgRating = reviewCount > 0
        ? Number((prod.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0;

    let images = [];
    if (prod.imageUrls) {
        if (Array.isArray(prod.imageUrls)) {
            images = prod.imageUrls;
        } else if (typeof prod.imageUrls === 'object') {
            if (Array.isArray(prod.imageUrls.images)) {
                images = prod.imageUrls.images;
            }
            if (prod.imageUrls.cover && !images.includes(prod.imageUrls.cover)) {
                images = [prod.imageUrls.cover, ...images];
            }
        } else if (typeof prod.imageUrls === 'string') {
            try {
                const parsed = JSON.parse(prod.imageUrls);
                if (Array.isArray(parsed)) images = parsed;
                else if (parsed.images) images = parsed.images;
            } catch {
                images = [prod.imageUrls];
            }
        }
    }

    const primaryImage = (prod.imageUrls && typeof prod.imageUrls === 'object' && prod.imageUrls.cover)
        ? prod.imageUrls.cover
        : (images[0] || "/placeholder.png");

    let categories = [];
    if (Array.isArray(prod.metadata?.category)) {
        categories = prod.metadata.category;
    } else if (typeof prod.metadata?.category === 'string' && prod.metadata.category) {
        categories = [prod.metadata.category];
    }

    const discount = prod.discount || 0;
    const effectivePrice = discount > 0
        ? Math.round(prod.price * (1 - discount / 100))
        : prod.price;

    return {
        id: prod.id,
        slug: prod.slug || prod.id,
        name: prod.title,
        title: prod.title,
        sku: prod.sku || '',
        description: prod.description || '',
        longDescription: prod.metadata?.longDescription || prod.description || '',
        price: effectivePrice,
        priceNum: effectivePrice,
        originalPrice: discount > 0 ? prod.price : undefined,
        discountPercentage: discount,
        currency: prod.currency || 'INR',
        image: primaryImage,
        images: images.length > 0 ? images : [primaryImage],
        category: categories[0] || 'General',
        categories: categories,
        tags: Array.isArray(prod.metadata?.tags) ? prod.metadata.tags : [],
        inStock: (prod.inventoryCount ?? 0) > 0,
        inventoryCount: prod.inventoryCount ?? 0,
        rating: avgRating,
        reviewsCount: reviewCount,
        variants: (prod.variants || []).map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku || '',
            price: v.price ?? effectivePrice,
            priceNum: v.price ?? effectivePrice,
            inStock: (v.inventoryCount ?? 0) > 0,
            inventoryCount: v.inventoryCount ?? 0,
            weight: v.weight ?? null
        })),
        createdAt: prod.createdAt
    };
}
