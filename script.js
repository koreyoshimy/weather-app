import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'odnaecsovijkjooqysll'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')
const output = document.getElementById('output')

// Example weather API function
async function fetchWeather(city) {
  const apiKey = 'YOUR_WEATHER_API_KEY'
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather API request failed')
  return await res.json()
}

async function saveWeatherHistory(weatherData) {
  const row = {
    city_name: weatherData.name,
    country_code: weatherData.sys?.country || null,
    temperature_c: weatherData.main?.temp ?? null,
    humidity: weatherData.main?.humidity ?? null,
    weather_main: weatherData.weather?.[0]?.main || null,
    weather_description: weatherData.weather?.[0]?.description || null,
    wind_speed: weatherData.wind?.speed ?? null,
    recorded_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('weather_history')
    .insert([row])

  if (error) {
    console.error('Supabase insert error:', error)
  }
}

searchBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim()
  if (!city) return

  try {
    const weatherData = await fetchWeather(city)

    output.textContent = JSON.stringify(weatherData, null, 2)

    await saveWeatherHistory(weatherData)
  } catch (err) {
    console.error(err)
    output.textContent = 'Failed to fetch weather data'
  }
})