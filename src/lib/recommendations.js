import { analytics } from './analytics';
import { guestUtils } from './guest';

export function getRecommendations(allProducts, limit = 8) {
    const interests = analytics.getUserInterests();
    const recentViews = guestUtils.getSearchHistory();

    if (interests.length === 0 && recentViews.length === 0) {
        return allProducts.slice(0, limit);
    }

    const scored = allProducts.map((product) => {
        let score = 0;
        const productCategory = product.category?.toLowerCase() || '';
        
        interests.forEach((interest) => {
            if (productCategory.includes(interest.toLowerCase())) {
                score += 10;
            }
            if (product.name?.toLowerCase().includes(interest.toLowerCase())) {
                score += 5;
            }
        });

        recentViews.forEach((search) => {
            if (product.name?.toLowerCase().includes(search.query.toLowerCase())) {
                score += 3;
            }
            if (productCategory.includes(search.query.toLowerCase())) {
                score += 2;
            }
        });

        if (product.isFeatured) score += 2;
        if (product.isNew) score += 1;

        return { product, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.product);
}

export default getRecommendations;