// src/pages/client/Homepage.jsx
import { usePageMeta } from "../../hooks/usePageMeta";

export default function Homepage() {
    const { pageMeta } = usePageMeta("home");

    return (
        <>
            <title>{pageMeta?.metaTitle}</title>
            <meta name="description" content={pageMeta?.metaDescription} />
            <meta name="keywords" content={pageMeta?.metaKeywords} />
            <link rel="canonical" href={pageMeta?.canonicalUrl} />

            <h1>Homepage</h1>
        </>
    );
}
