const shimmer = "relative overflow-hidden bg-secondary/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent";

export const ProductCardSkeleton = () => (
  <div className="glass-card rounded-xl overflow-hidden">
    <div className={`w-full h-56 ${shimmer}`} />
    <div className="p-4 space-y-2">
      <div className={`h-4 w-3/4 rounded ${shimmer}`} />
      <div className={`h-3 w-full rounded ${shimmer}`} />
      <div className={`h-3 w-2/3 rounded ${shimmer}`} />
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="pt-20 pb-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className={`h-4 w-32 rounded mt-8 mb-8 ${shimmer}`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className={`rounded-2xl h-[500px] ${shimmer}`} />
        <div className="space-y-4">
          <div className={`h-3 w-24 rounded ${shimmer}`} />
          <div className={`h-9 w-3/4 rounded ${shimmer}`} />
          <div className={`h-4 w-40 rounded ${shimmer}`} />
          <div className={`h-8 w-32 rounded ${shimmer}`} />
          <div className={`h-20 w-full rounded ${shimmer}`} />
          <div className={`h-12 w-full rounded ${shimmer}`} />
        </div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;