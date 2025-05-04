export interface Stock {
  symbol: string
  companyName: string
  marketCap: number
  sector: string
  industry: string
  beta: number
  price: number
  lastAnnualDividend: number
  volume: number
  exchange: string
  exchangeShortName: string
  country: string
  isEtf: boolean
  isFund: boolean
  isActivelyTrading: boolean
  changePercent?: number // We'll calculate this
}

export interface IndustrySummary {
  name: string
  averageChange: number
  stockCount: number
}

