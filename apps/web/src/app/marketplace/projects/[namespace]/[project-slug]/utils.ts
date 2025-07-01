export const MAX_TOOLS_TO_SHOW = 5
export const marketplacePublicProjectDetailTabs = [
  'overview',
  'readme',
  'tools',
  'pricing',
  'debug'
] as const
export const marketplacePublicProjectDetailTabsSet = new Set(
  marketplacePublicProjectDetailTabs
)
export type MarketplacePublicProjectDetailTab =
  (typeof marketplacePublicProjectDetailTabs)[number]
