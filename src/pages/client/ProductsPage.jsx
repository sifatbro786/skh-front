// src/pages/client/ProductsPage.jsx
// The catalog. All filter state lives in the query string — it makes every view
// shareable, gives the back button correct behaviour, and lets the homepage's
// range index deep-link straight in with ?category=Denim.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PackageSearch, Search, X } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useAsync } from "../../hooks/useAsync";
import { useDebounce } from "../../hooks/useDebounce";
import { productApi } from "../../services/productApi";
import { SITE } from "../../data/siteContent";
import ProductCard from "../../components/client/ProductCard";
import CategoryRail from "../../components/client/products/CategoryRail";
import CatalogToolbar from "../../components/client/products/CatalogToolbar";
import Pagination from "../../components/ui/Pagination";
import FilterChips from "../../components/ui/FilterChips";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonProductCard } from "../../components/ui/Skeleton";

const LIMIT = 12; // backend caps at 60; 12 keeps 4-col rows even

const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.09) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.06) 0 1px, transparent 1px 76px)",
    maskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
};

export default function ProductsPage() {
    const { pageMeta } = usePageMeta("products");
    const [params, setParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const category = params.get("category") || "";
    const search = params.get("search") || "";
    const sort = params.get("sort") || "";
    const rawPage = Number.parseInt(params.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    /* ------------------------------ URL state ---------------------------- */

    const updateParams = useCallback(
        (patch, { replace = false } = {}) => {
            setParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    Object.entries(patch).forEach(([key, value]) => {
                        const drop =
                            value === "" ||
                            value === null ||
                            value === undefined ||
                            (key === "page" && Number(value) <= 1);
                        if (drop) next.delete(key);
                        else next.set(key, String(value));
                    });
                    return next;
                },
                { replace },
            );
        },
        [setParams],
    );

    /* --------------------------- Debounced search ------------------------ */

    const [term, setTerm] = useState(search);
    const debounced = useDebounce(term, 400);
    // Guards the two-way sync below. Without it, typing writes the URL, the URL
    // writes the input, and the effects ping-pong.
    const lastSynced = useRef(search);

    useEffect(() => {
        if (debounced === lastSynced.current) return;
        lastSynced.current = debounced;
        // replace:true — typing shouldn't stack a history entry per keystroke.
        updateParams({ search: debounced, page: 1 }, { replace: true });
    }, [debounced, updateParams]);

    useEffect(() => {
        // External change: back button, a chip removal, "clear all".
        if (search === lastSynced.current) return;
        lastSynced.current = search;
        setTerm(search);
    }, [search]);

    /* -------------------------------- Data ------------------------------- */

    const { data, loading, error, retry } = useAsync(
        () => productApi.list({ category, search, sort, page, limit: LIMIT }),
        [category, search, sort, page],
    );

    const { data: catData } = useAsync(() => productApi.categories(), []);
    const categories = catData?.categories || [];

    const products = data?.products || [];
    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;
    const firstLoad = loading && !data;

    /* A deep link to ?page=9 on a catalog that shrank to 3 pages returns an
       empty grid with a valid 200. Clamp back rather than showing nothing. */
    useEffect(() => {
        if (!data || loading) return;
        if (page > pages) updateParams({ page: pages }, { replace: true });
    }, [data, loading, page, pages, updateParams]);

    /* ScrollToTop only watches `pathname`, so paging (a query-string change)
       never scrolls. Bring the grid back into view instead of the whole page —
       the filters stay where the user left them. */
    const gridRef = useRef(null);
    const mountedRef = useRef(false);
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [page]);

    /* ------------------------------- Filters ----------------------------- */

    const selectCategory = (name) => {
        updateParams({ category: name, page: 1 });
        setFiltersOpen(false);
    };

    const chips = [
        category && {
            key: "category",
            field: "Category",
            label: category,
            onRemove: () => updateParams({ category: "", page: 1 }),
        },
        search && {
            key: "search",
            field: "Search",
            label: search,
            onRemove: () => updateParams({ search: "", page: 1 }),
        },
    ].filter(Boolean);

    const clearAll = () => updateParams({ category: "", search: "", page: 1 });

    // The h1 reflects the active category, so the tab title should too — but a
    // CMS-authored metaTitle always wins.
    const title =
        pageMeta?.metaTitle ||
        (category
            ? `${category} — Product Catalog — ${SITE.name}`
            : `Product Catalog — ${SITE.name}`);
    const description =
        pageMeta?.metaDescription ||
        "Browse knitwear, woven, denim, outerwear, sportswear, home textiles and accessories produced through SKH Sourcing's vetted factory network.";

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? (
                <meta name="keywords" content={pageMeta.metaKeywords} />
            ) : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            {/* ------------------------------ Header ------------------------ */}
            <section className="relative overflow-hidden bg-surface-dark pt-10 pb-12 sm:pt-14 sm:pb-16">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={LATTICE}
                    aria-hidden="true"
                />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                            <li>
                                <Link to="/" className="transition-colors hover:text-brand-gold">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li className="text-brand-gold">Catalog</li>
                        </ol>
                    </nav>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
                        <div>
                            <h1 className="font-heading text-4xl leading-[1.08] font-extrabold tracking-[-0.03em] text-content-inverse sm:text-5xl">
                                {category ? category : "The full range"}
                            </h1>
                            {/* <div className="mt-5 flex items-center gap-2" aria-hidden="true">
                                <span className="h-1.5 w-1.5 bg-brand-gold" />
                                <span className="h-px w-20 bg-linear-to-r from-brand-gold to-transparent" />
                            </div> */}
                            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-content-subtle">
                                Every style here is made to order. Fabric, wash, trims and packaging
                                are open to your spec — these are starting points, not a fixed line
                                sheet.
                            </p>
                        </div>

                        {/* Search sits in the header because it's the primary action
                            on this page, not a toolbar afterthought. */}
                        <div className="lg:justify-self-end lg:pb-1">
                            <label htmlFor="catalog-search" className="sr-only">
                                Search the catalog
                            </label>
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40"
                                    aria-hidden="true"
                                />
                                <input
                                    id="catalog-search"
                                    type="search"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    placeholder="Search style, code or fabric…"
                                    className="h-12 w-full rounded-lg border border-white/15 bg-white/5 pr-10 pl-11 text-sm text-content-inverse placeholder:text-white/35 transition-colors outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 lg:w-104"
                                />
                                {term ? (
                                    <button
                                        type="button"
                                        onClick={() => setTerm("")}
                                        aria-label="Clear search"
                                        className="absolute top-1/2 right-3 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-content-inverse focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------- Body ------------------------- */}
            <section className="bg-surface py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
                        <aside className="hidden lg:block">
                            <div className="sticky top-24">
                                <CategoryRail
                                    categories={categories}
                                    active={category}
                                    total={categories.reduce((sum, c) => sum + (c.count || 0), 0)}
                                    onSelect={selectCategory}
                                />
                            </div>
                        </aside>

                        <div>
                            <CatalogToolbar
                                total={total}
                                page={page}
                                limit={LIMIT}
                                loading={loading}
                                sort={sort}
                                onSortChange={(value) => updateParams({ sort: value, page: 1 })}
                                onOpenFilters={() => setFiltersOpen(true)}
                                activeFilterCount={chips.length}
                            />

                            <FilterChips items={chips} onClearAll={clearAll} className="mt-5" />

                            <div ref={gridRef} className="scroll-mt-24 pt-8">
                                {firstLoad ? (
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <SkeletonProductCard key={i} />
                                        ))}
                                    </div>
                                ) : error ? (
                                    <EmptyState
                                        icon={PackageSearch}
                                        title="The catalog didn't load"
                                        description="The product feed didn't respond. Your connection or our server — either way, it's worth another try."
                                        action={
                                            <Button variant="outline" onClick={retry}>
                                                Try again
                                            </Button>
                                        }
                                    />
                                ) : products.length ? (
                                    <div
                                        // Keep the previous page rendered and dimmed while
                                        // the next one loads — a skeleton flash on every
                                        // pager click reads as a broken page.
                                        className={`grid grid-cols-1 gap-5 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${
                                            loading ? "pointer-events-none opacity-50" : ""
                                        }`}
                                    >
                                        {products.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={PackageSearch}
                                        title="Nothing matches those filters"
                                        description={
                                            search
                                                ? `No style matches “${search}”. Try a broader term, or tell us what you're after and we'll source it.`
                                                : "This category is still being loaded in. Tell us what you're after and we'll come back with options."
                                        }
                                        action={
                                            chips.length ? (
                                                <Button variant="outline" onClick={clearAll}>
                                                    Clear filters
                                                </Button>
                                            ) : null
                                        }
                                        secondaryAction={
                                            <Button as={Link} to="/contact">
                                                Send us your requirement
                                            </Button>
                                        }
                                    />
                                )}
                            </div>

                            <Pagination
                                page={page}
                                pages={pages}
                                onChange={(next) => updateParams({ page: next })}
                                className="mt-12"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile filter sheet — the Task 1 Modal, bottom-sheet on small screens. */}
            <Modal
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                title="Filter styles"
                eyebrow="Catalog"
                size="sm"
                footer={
                    <div className="flex gap-2.5">
                        <Button
                            variant="outline"
                            onClick={clearAll}
                            disabled={!chips.length}
                            className="flex-1"
                        >
                            Clear
                        </Button>
                        <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                            Show {total} {total === 1 ? "style" : "styles"}
                        </Button>
                    </div>
                }
            >
                <CategoryRail
                    categories={categories}
                    active={category}
                    total={categories.reduce((sum, c) => sum + (c.count || 0), 0)}
                    onSelect={selectCategory}
                />
            </Modal>
        </>
    );
}
