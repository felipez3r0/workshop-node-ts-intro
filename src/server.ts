import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'
import routes from './routes'
import cors from 'cors'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.use(cors()) // habilita o cors
app.use(express.json()) // habilita o express para receber dados no formato json
app.use(routes) // habilita as rotas

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
  console.log(`Banco de dados`, dataBase.isInitialized ? 'inicializado' : 'não inicializado')
})