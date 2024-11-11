import express from 'express'
import 'dotenv/config'

// express setup
const app = express()
const port = 3000

app.listen(port, () => {
  console.log("Running on port 3000")
})
