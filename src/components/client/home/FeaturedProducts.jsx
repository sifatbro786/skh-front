// src/components/client/home/FeaturedProducts.jsx
// Eight featured styles.
//
// `featured=true` is a HARD filter server-side — `if (req.query.featured !==
// undefined) filter.isFeatured = toBool(...)`. There is no implicit fallback, so
// a client who hasn't flagged anything yet would get an empty homepage grid.
// The task therefore falls back to the newest eight and relabels the section,
// rather than showing an empty state on a catalog that has products in it.
import { Link } from "react-router-dom";
import { ArrowRight, PackageSearch } from "lucide-react";
import SectionHeading from "../../ui/SectionHeading";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { SkeletonProductCard } from "../../ui/Skeleton";
import ProductCard from "../ProductCard";
import { useAsync } from "../../../hooks/useAsync";
import { productApi } from "../../../services/productApi";

const LIMIT = 8;

const loadFeatured = async () => {
    const featured = await productApi.list({ featured: true, limit: LIMIT });
    if (featured?.products?.length) return { ...featured, isFallback: false };

    // Second call only ever fires on an unflagged catalog — not on every load.
    const latest = await productApi.list({ limit: LIMIT });
    return { ...latest, isFallback: true };
};

export default function FeaturedProducts() {
    const { data, loading, error, retry } = useAsync(loadFeatured, []);

    const products = data?.products || [];
    const hasProducts = products.length > 0;
    const isFallback = Boolean(data?.isFallback);

    return (
        <section className="bg-surface py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow={isFallback ? "Latest additions" : "Selected styles"}
                    title="From the current range"
                    subtitle="A sample of what we're producing now. Every style is made to order — fabric, wash and trims are all open to your spec."
                    action={
                        <Button as={Link} to="/products" variant="outline" rightIcon={ArrowRight}>
                            View full catalog
                        </Button>
                    }
                />

                <div className="mt-12">
                    {loading && !hasProducts ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: LIMIT }).map((_, i) => (
                                <SkeletonProductCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <EmptyState
                            icon={PackageSearch}
                            title="Catalog didn't load"
                            description="The product feed didn't respond. Your connection or our server — either way, it's worth another try."
                            action={
                                <Button variant="outline" onClick={retry}>
                                    Try again
                                </Button>
                            }
                        />
                    ) : hasProducts ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product, i) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    // First row is above the fold on most desktops.
                                    priority={i < 4}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={PackageSearch}
                            title="The catalog is being loaded in"
                            description="Styles are being photographed and uploaded. Tell us what you're looking for and we'll come back with options directly."
                            action={
                                <Button as={Link} to="/contact">
                                    Send us your requirement
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
