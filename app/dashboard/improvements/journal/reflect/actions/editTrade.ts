'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

interface TradeData {
  id: string
  symbol: string
  side: string
  qty: number
  entry_price: number
  exit_price: number
  placing_time: string
  closing_time: string
  mistakes?: string
  strategy_id?: string
  setup_id?: string
  notes?: string
  screenshot_url?: string | null
  newScreenshot?: string
  deleteScreenshot?: boolean
}

export async function editTrade(tradeData: TradeData) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error(`User authentication failed: ${userError.message}`)
    }

    if (!userData?.user) {
      throw new Error('User data not found')
    }

    const userId = userData.user.id

    let screenshot_url = tradeData.screenshot_url

    // Handle image deletion
    if (tradeData.deleteScreenshot && tradeData.screenshot_url) {
      const fileNameToDelete = tradeData.screenshot_url.split('/').pop()
      if (fileNameToDelete) {
        console.log('Attempting to delete file:', fileNameToDelete);
        const { error: deleteError } = await supabase.storage
          .from('trade-screenshots')
          .remove([fileNameToDelete])

        if (deleteError) {
          console.error('Error deleting screenshot:', deleteError)
          throw new Error(`Failed to delete screenshot: ${deleteError.message}`)
        }
      }
      screenshot_url = null
    }

    // Handle new screenshot upload if provided
    if (tradeData.newScreenshot && tradeData.newScreenshot.startsWith('data:image')) {
      try {
        const fileName = `${userId}_${tradeData.id}_${uuidv4()}.jpg`
        const { data, error } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, decode(tradeData.newScreenshot), {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (error) {
          console.error('Error uploading screenshot:', error)
          throw new Error(`Failed to upload screenshot: ${error.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName)

        screenshot_url = urlData.publicUrl
      } catch (uploadError) {
        console.error('Error during screenshot upload:', uploadError)
        // Continue with the trade update even if the screenshot upload fails
      }
    }

    // Prepare the data for update, excluding newScreenshot and deleteScreenshot
    const { newScreenshot, deleteScreenshot, ...updateData } = tradeData

    const { data, error } = await supabase
      .from('trading_history')
      .update({
        ...updateData,
        screenshot_url,
        net_profit: tradeData.side === 'Sell'
          ? (tradeData.entry_price - tradeData.exit_price) * tradeData.qty
          : (tradeData.exit_price - tradeData.entry_price) * tradeData.qty
      })
      .eq('id', tradeData.id)
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('Error editing trade:', error)
      throw new Error(`Failed to edit trade: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Unexpected error in editTrade:', error)
    throw new Error(`Failed to edit trade: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to decode base64 image data
function decode(dataString: string): Buffer {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (matches?.length !== 3) {
    throw new Error('Invalid input string')
  }
  return Buffer.from(matches[2], 'base64')
}

