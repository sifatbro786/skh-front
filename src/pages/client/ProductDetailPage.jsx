// src/pages/client/ProductDetailPage.jsx
// Gallery + spec plate + RFQ. The spec plate is the anchor: a hairline docket of
// mono labels and values, the way a fabric swatch card is annotated — it's the
// part a buyer screenshots and pastes into an email.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Link2,
    Mail,
    PackageSearch,
    ShieldCheck,
} from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { productApi } from "../../services/productApi";
import { SITE } from "../../data/siteContent";
import { openRfqForProduct } from "../../lib/rfqBus";
import ProductGallery from "../../components/client/products/ProductGallery";
import RelatedProducts from "../../components/client/products/RelatedProducts";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton, SkeletonText } from "../../components/ui/Skeleton";

const ASSURANCES = [
    "Inline and final AQL inspection by our own QC team",
    "Fabric, wash and trims open to your specification",
    "Indicative costing back within one business day",
];

function SpecRow({ label, value, mono = false }) {
    if (!value) return null;
    return (
        <div className="flex gap-4 border-b border-border-subtle py-3 last:border-b-0">
            <dt className="w-28 shrink-0 text-[11px] font-bold tracking-[0.16em] text-content-subtle uppercase">
                {label}
            </dt>
            <dd
                className={`min-w-0 flex-1 text-[14px] text-content ${
                    mono ? "font-mono tracking-wider" : ""
                }`}
            >
                {value}
            </dd>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
                <Skeleton className="aspect-4/5 w-full" rounded="rounded-2xl" />
                <div className="space-y-6">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-9 w-3/4" />
                    <SkeletonText lines={3} />
                    <Skeleton className="h-40 w-full" rounded="rounded-xl" />
                    <Skeleton className="h-12 w-full" rounded="rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [copied, setCopied] = useState(false);

    const { data, loading, error } = useAsync(() => productApi.getById(id), [id]);
    const product = data?.product;

    // A malformed ObjectId is a 400 ("Invalid resource ID"), not a 404 — the
    // errorHandler maps CastError before it can reach the controller's 404. Both
    // mean the same thing to a visitor.
    const status = error?.response?.status;
    const notFound = status === 404 || status === 400;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Link copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard is unavailable on http:// origins and in some in-app
            // browsers — tell the user rather than failing silently.
            toast.error("Copy failed — select the address bar instead");
        }
    };

    if (loading && !product) {
        return (
            <>
                <title>{`Loading style — ${SITE.name}`}</title>
                <DetailSkeleton />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <title>{`Style not found — ${SITE.name}`}</title>
                <meta name="robots" content="noindex" />
                <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
                    <EmptyState
                        icon={PackageSearch}
                        title={
                            notFound
                                ? "That style isn't in the catalog"
                                : "Couldn't load this style"
                        }
                        description={
                            notFound
                                ? "It may have been renamed, retired, or the link was mistyped. The full range is still one click away."
                                : "The product feed didn't respond. Try again, or browse the catalog."
                        }
                        action={
                            <Button as={Link} to="/products" leftIcon={ArrowLeft}>
                                Back to catalog
                            </Button>
                        }
                        secondaryAction={
                            <Button as={Link} to="/contact" variant="outline">
                                Ask us about it
                            </Button>
                        }
                    />
                </div>
            </>
        );
    }

    const paragraphs = (product.description || "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    const updated = product.updatedAt
        ? new Date(product.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <>
            <title>{`${product.title} — ${SITE.name}`}</title>
            <meta
                name="description"
                content={
                    product.fabricDetails ||
                    product.description?.slice(0, 155) ||
                    `${product.category} sourced and quality-inspected by ${SITE.name}.`
                }
            />
            <meta property="og:type" content="product" />
            <meta property="og:title" content={product.title} />

            <div className="bg-surface-raised">
                <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
                            <li>
                                <Link to="/" className="transition-colors hover:text-brand-gold">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link
                                    to="/products"
                                    className="transition-colors hover:text-brand-gold"
                                >
                                    Catalog
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link
                                    to={`/products?category=${encodeURIComponent(product.category)}`}
                                    className="transition-colors hover:text-brand-gold"
                                >
                                    {product.category}
                                </Link>
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
                        {/* Sticky on desktop so the gallery stays with the spec as
                            the buyer reads down a long description. */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <ProductGallery images={product.images} title={product.title} />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-brand-gold uppercase">
                                    {product.category}
                                </span>
                                {product.isFeatured ? (
                                    <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-content-muted uppercase">
                                        Featured
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="mt-3 font-heading text-3xl leading-[1.1] font-extrabold tracking-tight text-content sm:text-4xl">
                                {product.title}
                            </h1>

                            {product.fabricDetails ? (
                                <p className="mt-5 text-[15px] leading-relaxed text-content-muted">
                                    {product.fabricDetails}
                                </p>
                            ) : null}

                            {/* Spec plate */}
                            <dl className="mt-8 rounded-xl border border-border-subtle bg-surface-inset/50 px-5">
                                <SpecRow label="Code" value={product.code} mono />
                                <SpecRow label="Category" value={product.category} />
                                <SpecRow label="MOQ" value={product.moq || "On request"} />
                                <SpecRow label="Lead time" value="Quoted per order" />
                                <SpecRow label="Updated" value={updated} />
                            </dl>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    size="lg"
                                    rightIcon={ArrowRight}
                                    onClick={() => openRfqForProduct(product, "product-detail")}
                                    className="flex-1"
                                >
                                    Request a quote
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    leftIcon={copied ? Check : Link2}
                                    onClick={copyLink}
                                    className="sm:w-auto"
                                >
                                    {copied ? "Copied" : "Copy link"}
                                </Button>
                            </div>

                            <ul className="mt-7 space-y-2.5">
                                {ASSURANCES.map((line) => (
                                    <li key={line} className="flex gap-2.5">
                                        <ShieldCheck
                                            className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold"
                                            aria-hidden="true"
                                        />
                                        <span className="text-[13.5px] leading-relaxed text-content-muted">
                                            {line}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {paragraphs.length ? (
                                <div className="mt-10 border-t border-border-subtle pt-8">
                                    <h2 className="font-heading text-[11px] font-bold tracking-[0.24em] text-content-muted uppercase">
                                        Details
                                    </h2>
                                    <div className="mt-4 space-y-4">
                                        {paragraphs.map((para, i) => (
                                            <p
                                                key={i}
                                                className="text-[14.5px] leading-relaxed whitespace-pre-line text-content-muted"
                                            >
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <p className="mt-8 text-[13px] text-content-subtle">
                                Need this in a different fabric or wash?{" "}
                                <a
                                    href={`mailto:inquiry@skhsourcing.com?subject=${encodeURIComponent(
                                        `Enquiry — ${product.title}${product.code ? ` (${product.code})` : ""}`,
                                    )}`}
                                    className="inline-flex items-center gap-1 font-semibold text-brand-gold underline-offset-4 hover:underline"
                                >
                                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                    Email the merchandising team
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedProducts category={product.category} excludeId={product._id} />
        </>
    );
}
