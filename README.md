# Workshop - Node / Express / Typescript - Intro

Para visualizar o projeto navegue pelas branchs que representam cada etapa do desenvolvimento

# Requisitos do projeto
- Node (v18 ou posterior)

## Etapas

- [Etapa 1 - Configuração do projeto](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa1-configuracao)
- [Etapa 2 - Preparação do Express](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa2-preparacao-express)
- [Etapa 3 - Configuração do BD](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa3-configuracao-bd)

## Passo a passo

### Etapa 1 - Configuração do projeto

Vamos inicializar a aplicação com o Yarn (pode ser utilizado o NPM sem problema)
```shell
yarn init
```

Adicionamos o express e o dotenv
```shell
yarn add express dotenv
```

Adicionamos o nodemon para facilitar o desenvolvimento
```shell
yarn add -D nodemon
```

Configuramos o typescript e os tipos do node e do express
```shell
yarn add -D typescript @types/node @types/express ts-node-dev
```

Criamos o arquivo de configuração do typescript
```shell
yarn tsc --init
```

Ajustamos o package.json para executar o nodemon com o ts-node-dev
```json
"scripts": {
    "dev": "nodemon --exec ts-node-dev src/server.ts"
  },
```

Criamos a pasta src e o arquivo server.ts, nesse arquivo adicionamos apenas um console.log para testar a execução
```typescript
console.log('Olá!')
```

Executamos o projeto para testar
```shell
yarn dev
```

### Etapa 2 - Preparação do Express

Criamos o arquivo .env na raiz do projeto e adicionamos a porta que será utilizada
```env
PORT=3000
```

Adicionamos o arquivo .env ao .gitignore
```gitignore
node_modules
.env
```

Ajustamos o arquivo server.ts para utilizar o express e a porta definida no .env
```typescript
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
})
```

Agora conseguimos executar o projeto e visualizar a mensagem no console (também podemos testar no navegador)
```shell
yarn dev
```

### Etapa 3 - Configuração do BD (Sqlite + TypeORM)

Adicionamos o sqlite e typeorm
```shell
yarn add sqlite3 typeorm
```

Criamos uma pasta src/database e o arquivo ormconfig.ts
```typescript
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config() // carrega as variáveis de ambiente do arquivo .env

const dataBase = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || './src/database/database.sqlite',
  entities: [
    './src/models/*.ts'
  ],
  logging: true, // log das queries executadas
  synchronize: true // cria as tabelas automaticamente
})

dataBase.initialize()
  .then(() => {
    console.log(`Banco de dados inicializado`);
  })
  .catch((err) => {
    console.error(`Erro ao inicializar o banco de dados`, err);
  })

export default dataBase
```

Criamos uma pasta src/models e o arquivo Task.ts
```typescript
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({default: false})
  completed!: boolean
}
```

Para usarmos os decorators do typeorm precisamos habilitar no tsconfig.json
```json
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
```

Ajustamos o arquivo server.ts para utilizar o banco de dados
```typescript
import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
  console.log(`Banco de dados`, dataBase.isInitialized ? 'inicializado' : 'não inicializado')
})
```
