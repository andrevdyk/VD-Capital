import ReactCountryFlag from "react-country-flag"
import { Bitcoin, Coins, Droplet, Flame } from "lucide-react"

// Map of currency codes to ISO country codes for flags
const currencyToCountry: Record<string, string> = {
  // Major currencies
  USD: "US", // United States Dollar
  EUR: "EU", // Euro
  JPY: "JP", // Japanese Yen
  GBP: "GB", // British Pound
  AUD: "AU", // Australian Dollar
  CAD: "CA", // Canadian Dollar
  CHF: "CH", // Swiss Franc
  NZD: "NZ", // New Zealand Dollar

  // Other common currencies
  CNY: "CN", // Chinese Yuan
  HKD: "HK", // Hong Kong Dollar
  SGD: "SG", // Singapore Dollar
  SEK: "SE", // Swedish Krona
  NOK: "NO", // Norwegian Krone
  MXN: "MX", // Mexican Peso
  INR: "IN", // Indian Rupee
  ZAR: "ZA", // South African Rand
  BRL: "BR", // Brazilian Real
  RUB: "RU", // Russian Ruble
  TRY: "TR", // Turkish Lira
  PLN: "PL", // Polish Złoty
  THB: "TH", // Thai Baht
  KRW: "KR", // South Korean Won
  DKK: "DK", // Danish Krone
}

// Set of cryptocurrency symbols
const cryptoCurrencies = new Set(["BTC", "ETH", "XRP", "LTC", "DOGE", "ADA", "DOT", "LINK", "UNI", "SOL"])

// Set of commodity symbols
const commodities = new Set([
  "GOLD",
  "SILVER",
  "OIL",
  "NATGAS",
  "COPPER",
  "PLATINUM",
  "PALLADIUM",
  "WHEAT",
  "CORN",
  "COTTON",
])

interface CurrencyFlagProps {
  symbol: string
}

export function CurrencyFlag({ symbol }: CurrencyFlagProps) {
  // Parse the symbol to extract currency codes
  const parseCurrencyPair = (symbol: string): [string, string] | null => {
    // Handle common forex pairs (6 characters like EURUSD)
    if (symbol.length === 6) {
      const base = symbol.substring(0, 3)
      const quote = symbol.substring(3, 6)
      return [base, quote]
    }

    // Handle symbols with separators like EUR/USD or EUR.USD
    if (symbol.includes("/") || symbol.includes(".")) {
      const separator = symbol.includes("/") ? "/" : "."
      const [base, quote] = symbol.split(separator)
      return [base, quote]
    }

    // If we can't parse it, return the symbol itself and empty string
    return [symbol, ""]
  }

  const currencyPair = parseCurrencyPair(symbol)

  if (!currencyPair) {
    return <span className="ml-2">{symbol}</span>
  }

  const [baseCurrency, quoteCurrency] = currencyPair

  // Render cryptocurrency
  if (cryptoCurrencies.has(baseCurrency)) {
    return (
      <div className="flex items-center">
        <div className="relative mr-3 w-10 h-6">
          <div className="absolute bottom-0 left-0 z-10 w-6 h-6 flex items-center justify-center bg-yellow-500 text-white rounded-full border-2 border-gray-800">
            <Bitcoin className="h-4 w-4" />
          </div>
          {quoteCurrency && currencyToCountry[quoteCurrency] && (
            <div className="absolute top-0 right-0 z-0">
              <ReactCountryFlag
                countryCode={currencyToCountry[quoteCurrency]}
                svg
                style={{
                  width: "1.5em",
                  height: "1.5em",
                  borderRadius: "50%",
                  border: "2px solid #1f2937", // border-gray-800
                }}
              />
            </div>
          )}
        </div>
        <span>{symbol}</span>
      </div>
    )
  }

  // Render commodity
  if (commodities.has(baseCurrency)) {
    return (
      <div className="flex items-center">
        <div className="relative mr-3 w-10 h-6">
          <div className="absolute bottom-0 left-4 z-10 w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-800">
            {baseCurrency === "GOLD" && (
              <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center">
                <Coins className="h-4 w-4 text-yellow-700" />
              </div>
            )}
            {baseCurrency === "SILVER" && (
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <Coins className="h-4 w-4 text-gray-600" />
              </div>
            )}
            {baseCurrency === "OIL" && (
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Droplet className="h-4 w-4 text-gray-300" />
              </div>
            )}
            {baseCurrency === "NATGAS" && (
              <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            )}
            {!["GOLD", "SILVER", "OIL", "NATGAS"].includes(baseCurrency) && (
              <div className="w-full h-full bg-amber-600 rounded-full flex items-center justify-center">
                <Coins className="h-4 w-4 text-amber-200" />
              </div>
            )}
          </div>
          {quoteCurrency && currencyToCountry[quoteCurrency] && (
            <div className="absolute top-0 right-0 z-0">
              <ReactCountryFlag
                countryCode={currencyToCountry[quoteCurrency]}
                svg
                style={{
                  width: "1.5em",
                  height: "1.5em",
                  borderRadius: "50%",
                  border: "2px solid #1f2937", // border-gray-800
                }}
              />
            </div>
          )}
        </div>
        <span>{symbol}</span>
      </div>
    )
  }

  // Render currency pair with overlapping flags
  return (
    <div className="flex items-center">
      <div className="relative mr-3 w-10 h-6">
        {currencyToCountry[baseCurrency] && (
          <div className="absolute bottom-0 left-2 top-2 z-10">
            <ReactCountryFlag
              countryCode={currencyToCountry[baseCurrency]}
              svg
              style={{
                width: "1.5em",
                height: "1.5em",
                borderRadius: "50%",
                
              }}
            />
          </div>
        )}
        {quoteCurrency && currencyToCountry[quoteCurrency] && (
          <div className="absolute top-0 right-0 z-0">
            <ReactCountryFlag
              countryCode={currencyToCountry[quoteCurrency]}
              svg
              style={{
                width: "1.5em",
                height: "1.5em",
                borderRadius: "50%",
                
              }}
            />
          </div>
        )}
      </div>
      <span>{symbol}</span>
    </div>
  )
}
