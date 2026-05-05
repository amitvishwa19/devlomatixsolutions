import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "../../_contexts/WishlistContext";
import { products } from "../../_data/products";
import { Card, CardContent } from "@/components/ui/card";

const WishlistSection = () => {
  const { wishlistIds } = useWishlist();
  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">My Wishlist</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {wishlistedProducts.length} saved items
        </p>
      </div>
      {wishlistedProducts.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
          <Heart className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-serif text-lg">No favorites yet</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any product to save it
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistedProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-all">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {p.name}
                  </p>
                  <p className="text-gold text-sm mt-1">
                    ₹{p.price.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default WishlistSection;