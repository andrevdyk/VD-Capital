"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Asset interface based on the Supabase schema
interface Asset {
  id: string
  symbol: string
  base_currency: string
  quote_currency: string
  classification: string
  asset_type: string
}

interface AssetFilterProps {
  onAssetChange?: (asset: string) => void
}

export function AssetFilter({ onAssetChange }: AssetFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedAsset, setSelectedAsset] = React.useState(searchParams.get("asset") || "EURUSD")
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [loading, setLoading] = React.useState(true)

  // Replace the fetchAssets function with this Supabase implementation
  const fetchAssets = async () => {
    try {
      setLoading(true)

      // Query the assets table from Supabase
      const { data, error } = await supabase.from("assets").select("*")

      if (error) {
        throw error
      }

      if (data) {
        setAssets(data)
      }
    } catch (error) {
      console.error("Error fetching assets from Supabase:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch assets data from the provided CSV URL
  React.useEffect(() => {
    fetchAssets()
  }, [])

  // Get unique asset types for category tabs
  const assetTypes = React.useMemo(() => {
    const types = new Set<string>()
    assets.forEach((asset) => {
      if (asset.asset_type) {
        types.add(asset.asset_type)
      }
    })
    return Array.from(types)
  }, [assets])

  // Filter assets based on search query and selected category
  const filteredAssets = React.useMemo(() => {
    if (loading) return []

    let filtered = assets

    // Filter by asset type if not "all"
    if (selectedCategory !== "all" && selectedCategory !== "currencies") {
      // If it's a currency filter (like "EUR", "USD", etc.)
      if (selectedCategory.length <= 3) {
        filtered = assets.filter(
          (asset) => asset.base_currency === selectedCategory || asset.quote_currency === selectedCategory,
        )
      } else {
        // Otherwise filter by asset type
        filtered = assets.filter((asset) => asset.asset_type === selectedCategory)
      }
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.base_currency.toLowerCase().includes(query) ||
          asset.quote_currency.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [assets, selectedCategory, searchQuery, loading])

  // Get unique currencies for additional filtering options
  const currencies = React.useMemo(() => {
    const currencySet = new Set<string>()
    assets.forEach((asset) => {
      if (asset.asset_type === "Currency") {
        if (asset.base_currency) currencySet.add(asset.base_currency)
        if (asset.quote_currency) currencySet.add(asset.quote_currency)
      }
    })
    return Array.from(currencySet).sort()
  }, [assets])

  // Handle asset selection
  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset.symbol)
    setIsSearchOpen(false)

    // Update URL with the selected asset
    const params = new URLSearchParams(searchParams)
    params.set("asset", asset.symbol)
    router.push(`?${params.toString()}`)

    // Call the callback if provided
    if (onAssetChange) {
      onAssetChange(asset.symbol)
    }
  }

  // Format asset name for display
  const formatAssetName = (asset: Asset) => {
    if (asset.asset_type === "Currency" && asset.base_currency && asset.quote_currency) {
      return `${asset.base_currency}/${asset.quote_currency}`
    }
    return asset.symbol
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8 px-3 w-[300px]"
            aria-label="Search assets"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="font-medium text-sm">{selectedAsset}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[650px] p-0" align="center">
          <div className="p-3 border-b">
            <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-7 h-8">
                <TabsTrigger value="all" className="text-xs px-1">
                  All
                </TabsTrigger>
                {assetTypes.map((type) => (
                  <TabsTrigger key={type} value={type} className="text-xs px-1">
                    {type}
                  </TabsTrigger>
                ))}
                {/* Add a tab for major currencies */}
                <TabsTrigger value="currencies" className="text-xs px-1">
                  Currencies
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Show currency filters when "currencies" tab is selected */}
            {selectedCategory === "currencies" && (
              <div className="mt-2 flex flex-wrap gap-1">
                {currencies.map((currency) => (
                  <Button
                    key={currency}
                    variant={selectedCategory === currency ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => setSelectedCategory(currency)}
                  >
                    {currency}
                  </Button>
                ))}
              </div>
            )}

            <div className="mt-2">
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading assets...</div>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <Button
                  key={asset.id}
                  variant="ghost"
                  className="w-full justify-start px-3 py-1.5 h-auto text-sm"
                  onClick={() => handleAssetSelect(asset)}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{formatAssetName(asset)}</span>
                    <span className="ml-2 text-muted-foreground text-xs">{asset.classification}</span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No assets found</div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 text-xs px-2">
          Compare
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs px-2">
          Watchlist
        </Button>
      </div>
    </div>
  )
}

