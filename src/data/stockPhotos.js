// src/data/stockPhotos.js
// Placeholder editorial stock — the same curated set the homepage hero uses
// (see HeroSection.jsx), so interior pages read as one shoot rather than
// mismatched stock. Swap every value for real factory/floor photography
// whenever it's shot; nothing here should still be pointing at Unsplash by
// launch.
export const STOCK_PHOTOS = {
    sewingFloor:
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80&auto=format&fit=crop",
    denimStack:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80&auto=format&fit=crop",
    qualityDetail:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80&auto=format&fit=crop",
    fabricRolls:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80&auto=format&fit=crop",
};

const u = (id) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

/**
 * Per-category catalog stand-ins, keyed by the backend's Product.category values.
 * The seed data ships navy "PLACEHOLDER — REPLACE BEFORE LAUNCH" SVGs; showing a
 * garment that at least matches the category reads far better than that, and
 * resolveProductImages() labels them so nobody mistakes one for the real style.
 *
 * Several per category on purpose: with one photo each, two Denim styles sitting
 * side by side in the grid render the identical picture, which is exactly what
 * makes a catalog look auto-generated. resolveProductImages() spreads styles
 * across the list deterministically, so the same product always gets the same
 * frame while its neighbours get different ones.
 *
 * Same rule as STOCK_PHOTOS: every one of these is temporary. Once a style has
 * real photography uploaded, that wins automatically and none of this is used.
 */
export const CATEGORY_STOCK = {
    Knitwear: [
        u("photo-1620799140408-edc6dcb6d633"), // white crewneck flat lay
        u("photo-1523381294911-8d3cead13475"), // sage tees on wooden hangers
        u("photo-1618354691373-d851c5c3a990"), // black tee on hanger
        u("photo-1578681994506-b8f463449011"), // black sweatshirt, worn
    ],
    Woven: [
        u("photo-1602810318383-e386cc2a3ccf"), // folded dress shirts
        u("photo-1596755094514-f87e34085b2c"), // chambray button-down on hanger
        u("photo-1567401893414-76b7b1e5a7a5"), // shirting on a retail rail
    ],
    Denim: [
        u("photo-1542272604-787c3835535d"), // folded jeans, low key
        u("photo-1604176354204-9268737828e4"), // indigo denim stack
        u("photo-1565084888279-aca607ecce0c"), // folded jeans, bulk stacks
        u("photo-1598554747436-c9293d6a588f"), // light wash jeans, studio
    ],
    Outerwear: [
        u("photo-1591047139829-d91aecb6caea"), // terracotta bomber on hanger
        u("photo-1551028719-00167b16eac5"), // black biker jacket
        u("photo-1544022613-e87ca75a784a"), // olive utility jacket
    ],
    Sportswear: [
        u("photo-1515886657613-9f3515b0c78f"), // yellow tracksuit, editorial
        u("photo-1584464491033-06628f3a6b7b"), // training kit in a gym
        u("photo-1518310383802-640c2de311b2"), // activewear, group session
        u("photo-1461896836934-ffe607ba8211"), // track kit at the blocks
    ],
    "Home Textile": [
        u("photo-1600369672770-985fd30004eb"), // folded throws and blankets
        u("photo-1629949009765-40fc74c9ec21"), // cushion on a knit throw
        u("photo-1528822855841-e8bf3134cdc9"), // sheer curtain light
        u("photo-1522771739844-6a9f6d5f14af"), // made bed, cushions
    ],
    Accessories: [
        u("photo-1553062407-98eeb64c6a62"), // navy backpack
        u("photo-1556905055-8f358a7a47b2"), // knit + watch flat lay
        u("photo-1616150638538-ffb0679a3fc4"), // bags and canvas goods
        u("photo-1547949003-9792a18a2601"), // leather-trim messenger bag
    ],
    Yarn: [u("photo-1584992236310-6edddc08acff")],
};

/** Used when a category has no entry above (admin adds a new one). */
export const CATEGORY_STOCK_FALLBACK = STOCK_PHOTOS.sewingFloor;
