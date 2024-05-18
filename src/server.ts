import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'
import routes from './routes'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.use(cors(
  {
    origin: ['http://localhost:3001', 'http://localhost:5173', /\.onrender\.com$/],
    credentials: true
  }
)) // habilita o cors
app.use(cookieParser()) // habilita o cookie parser
app.use(express.json()) // habilita o express para receber dados no formato json
app.use(routes) // habilita as rotas

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
  console.log(`Banco de dados`, dataBase.isInitialized ? 'inicializado' : 'não inicializado')
})
