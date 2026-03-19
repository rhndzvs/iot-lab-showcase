require('dotenv').config()
const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/readings', async (req, res) => {
  const { temperature, humidity, status, threshold } = req.body

  console.log('[POST /api/readings] Incoming payload:', {
    temperature,
    humidity,
    status,
    threshold,
  })

  const parsedTemperature = Number(temperature)
  const parsedHumidity = Number(humidity)

  if (Number.isNaN(parsedTemperature) || Number.isNaN(parsedHumidity)) {
    console.log('[POST /api/readings] Insert failed: invalid numeric values')
    return res.status(400).json({
      error: 'Invalid payload: temperature and humidity must be valid numbers.',
    })
  }

  if (status !== 'normal' && status !== 'alert') {
    console.log('[POST /api/readings] Insert failed: invalid status value')
    return res.status(400).json({
      error: 'Invalid payload: status must be either "normal" or "alert".',
    })
  }

  if (!supabase) {
    console.log('[POST /api/readings] Insert failed: missing Supabase env vars')
    return res.status(500).json({
      error: 'Server configuration error: missing Supabase credentials.',
    })
  }

  try {
    const { error } = await supabase
      .from('lab1_sensor_logs')
      .insert([
        {
          temperature: parsedTemperature,
          humidity: parsedHumidity,
          status,
          threshold,
        },
      ])

    if (error) {
      console.log('[POST /api/readings] Insert failed:', error.message)
      return res.status(500).json({
        error: 'Failed to save sensor reading.',
        details: error.message,
      })
    }

    console.log('[POST /api/readings] Insert succeeded')
    return res.status(200).json({ message: 'Sensor reading saved successfully.' })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.log('[POST /api/readings] Insert failed:', errorMessage)
    return res.status(500).json({
      error: 'Failed to save sensor reading.',
      details: errorMessage,
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})