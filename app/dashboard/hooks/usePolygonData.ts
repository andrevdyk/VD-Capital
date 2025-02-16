export async function getPolygonData() {
    try {
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/C:EURUSD/range/1/day/2023-01-09/2025-02-10?adjusted=true&sort=asc&apiKey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`,
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const result = await response.json()
      return result.results
    } catch (err) {
      console.error("Error fetching data:", err)
      throw err
    }
  }
  
  

