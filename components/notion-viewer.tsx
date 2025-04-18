"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchNotionData } from "@/app/actions/notion"

export function NotionViewer() {
  const [data, setData] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching Notion data...")

      const result = await fetchNotionData()
      console.log("Data fetched successfully")

      setData(JSON.stringify(result, null, 2))
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      <Button onClick={handleFetchData} disabled={loading} className="self-start">
        {loading ? "Loading..." : "Fetch Notion Data"}
      </Button>

      <Card className="w-full border-2">
        <CardContent className="p-4">
          {error ? (
            <div className="text-red-500 p-4 whitespace-pre-wrap">
              <h3 className="font-bold mb-2">Error:</h3>
              {error}
            </div>
          ) : data ? (
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] w-full font-mono text-sm whitespace-pre-wrap">
              {data}
            </pre>
          ) : (
            <div className="text-gray-500 p-4 text-center">Click the button above to fetch data from Notion</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
