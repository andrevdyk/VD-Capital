"use client"

import * as React from "react"

// Define the context type
interface AssetFilterContextType {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

// Create the context with a default value
const AssetFilterContext = React.createContext<AssetFilterContextType>({
  selectedAsset: "EUR/USD",
  setSelectedAsset: () => {},
})

// Create a provider component
export function AssetFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedAsset, setSelectedAsset] = React.useState<string>("EUR/USD")

  const value = React.useMemo(
    () => ({
      selectedAsset,
      setSelectedAsset,
    }),
    [selectedAsset],
  )

  return <AssetFilterContext.Provider value={value}>{children}</AssetFilterContext.Provider>
}

// Create a hook to use the context
export function useAssetFilter() {
  const context = React.useContext(AssetFilterContext)
  if (context === undefined) {
    throw new Error("useAssetFilter must be used within an AssetFilterProvider")
  }
  return context
}

