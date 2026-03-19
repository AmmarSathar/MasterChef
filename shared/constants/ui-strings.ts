// ── UI Strings ─────────────────────────────────────────

export const SAD_KAOMOJIS = [
    "(⊙_⊙;)",
    "(；￣Д￣)",
    "ლ(ಠ益ಠლ)",
    "(╥﹏╥)",
    "(°ロ°) !",
    "ヽ(ಠ_ಠ)ノ",
    "(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)",
    "(´°̥̥̥̥̥̥̥̥ ω °̥̥̥̥̥̥̥̥｀)",
] as const;

export type NoResultsKaomoji = (typeof SAD_KAOMOJIS)[number];
