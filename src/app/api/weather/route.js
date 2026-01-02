import { NextResponse } from "next/server"
import { weatherController } from "@/backend/controllers/weatherController.js"

export async function POST(request) {
  try {
    const body = await request.json()
    const { city, country } = body

    // Validate required fields
    if (!city) {
      return NextResponse.json({ 
        success: false, 
        message: "City is required" 
      }, { status: 400 })
    }

    // Get weather data
    const result = await weatherController.getWeatherData(city, country)

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')

    // Validate required fields
    if (!city) {
      return NextResponse.json({ 
        success: false, 
        message: "City parameter is required" 
      }, { status: 400 })
    }

    // Get weather data
    const result = await weatherController.getWeatherData(city, country || "")

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
