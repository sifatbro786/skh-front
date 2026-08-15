// src/components/client/products/RelatedProducts.jsx
// Same-category styles, current one excluded. Fetches limit+1 so removing the
// current product can't leave a short row.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ProductCard";
import Button from "../../ui/Button";
import { SkeletonProductCard } from "../../ui/Skeleton";
import { useAsync } from "../../../hooks/useAsync";
import { productApi } from "../../../services/productApi";

const SHOW = 4;

export default function RelatedProducts({ category, excludeId }) {
    const { data, loading } = useAsync(
        () => (category ? productApi.list({ category, limit: SHOW + 1 }) : Promise.resolve(null)),
        [category],
    );

    const items = (data?.products || []).filter((p) => p._id !== excludeId).slice(0, SHOW);

    // Nothing to show and nothing coming — don't leave an orphan heading.
    if (!category || (!loading && !items.length)) return null;

    return (
        <section className="border-t border-border-subtle bg-surface py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.24em] text-brand-gold uppercase">
                            More in this category
                        </p>
                        <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-[-0.02em] text-content sm:text-3xl">
                            {category}
                        </h2>
                    </div>
                    <Button
                        as={Link}
                        to={`/products?category=${encodeURIComponent(category)}`}
                        variant="outline"
                        rightIcon={ArrowRight}
                    >
                        See all {category}
                    </Button>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {loading && !items.length
                        ? Array.from({ length: SHOW }).map((_, i) => (
                              <SkeletonProductCard key={i} />
                          ))
                        : items.map((product) => (
                              <ProductCard key={product._id} product={product} />
                          ))}
                </div>
            </div>
        </section>
    );
}
