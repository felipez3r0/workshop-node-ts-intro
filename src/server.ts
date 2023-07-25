import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
})