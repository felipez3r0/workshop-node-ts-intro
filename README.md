# Workshop - Node / Express / Typescript - Intro

Para visualizar o projeto navegue pelas branchs que representam cada etapa do desenvolvimento

# Requisitos do projeto
- Node (v18 ou posterior)

## Etapas

- [Etapa 1 - Configuração do projeto](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa1-configuracao)
- [Etapa 2 - Preparação do Express](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa2-preparacao-express)
- [Etapa 3 - Configuração do BD](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa3-configuracao-bd)
- [Etapa 4 - Criando uma task](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa4-criando-task)
- [Etapa 5 - Listando tasks](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa5-listando-tasks)
- [Etapa 6 - Removendo e atualizando tasks](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa6-removendo-atualizando-task)
- [Etapa 7 - Configurando o build](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa7-build)
- [Etapa 8 - Deploy](https://github.com/felipez3r0/workshop-node-ts-intro#etapa-8---deploy)
- [Etapa 9 - CORS](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa9-cors)
- [Etapa 10 - Autenticação](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa10-auth)
- [Etapa 11 - Tarefas por usuário](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa11-user-tasks)
- [Etapa 12 - Ajusta email para ser único](https://github.com/felipez3r0/workshop-node-ts-intro/tree/etapa12-email-unico)

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

### Etapa 4 - Criando uma task

Vamos organizar melhor uma estrutura de pastas para separar as responsabilidades da aplicação - como estamos tendando criar uma API bem simples aqui vamos adotar apenas um modelo de Model/Controller - nosso Controller vai buscar os dados no Model e retornar para o client
```
src
├── controllers
│   └── task
│       └── task.controller.ts
├── database
│   └── ormconfig.ts
├── models
│   └── task.entity.ts
├── routes
│   └── task
│       └── task.routes.ts
│   └── index.ts
└── server.ts
```

Criamos o arquivo src/routes/index.ts
```typescript
import { Router } from 'express'
import taskRoutes from './task/task.routes'

const routes = Router()

routes.use('/task', taskRoutes)

export default routes
```

Criamos o arquivo src/routes/task/task.routes.ts
```typescript
import { Router } from 'express'
import TaskController from '../../controllers/task/task.controller'

const taskRoutes = Router()

taskRoutes.post('/', TaskController.store)

export default taskRoutes
```

Criamos o arquivo src/controllers/task/task.controller.ts
```typescript
import { Request, Response } from 'express'
import Task from '../../models/task.entity'

export default class TaskController {
  static async store (req: Request, res: Response) {
    const { title, completed } = req.body

    if (!title) {
      return res.status(400).json({ error: 'O título é obrigatório' })
    }

    const task = new Task()
    task.title = title
    task.completed = completed || false
    await task.save()

    return res.status(201).json(task)
  }
}
```

Ajustamos o arquivo src/server.ts para utilizar as rotas
```typescript
import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'

import routes from './routes'

dotenv.config()
const app = express()
const port = process.env.PORT || 3001

app.use(express.json()) // habilita o express para receber dados no formato json
app.use(routes) // habilita as rotas

app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
  console.log(`Banco de dados`, dataBase.isInitialized ? 'inicializado' : 'não inicializado')
})
```

### Etapa 5 - Listando as tasks

Vamos criar uma rota para listar as tasks no arquivo src/routes/task/task.routes.ts
```typescript
taskRoutes.get('/', TaskController.index)
```

E o método index no controller src/controllers/task/task.controller.ts
```typescript
static async index (req: Request, res: Response) {
  const tasks = await Task.find()
  return res.json(tasks)
}
```

Vamos criar uma rota para buscar uma task no arquivo src/routes/task/task.routes.ts
```typescript
taskRoutes.get('/:id', TaskController.show)
```

E o método show no controller src/controllers/task/task.controller.ts
```typescript
  static async show (req: Request, res: Response) {
    const { id } = req.params

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    const task = await Task.findOneBy({id: Number(id)})
    return res.json(task)
  }
```

### Etapa 6 - Removendo e atualizando tasks

Vamos criar uma rota para remover uma task no arquivo src/routes/task/task.routes.ts
```typescript
taskRoutes.delete('/:id', TaskController.delete)
```

E o método delete no controller src/controllers/task/task.controller.ts
```typescript
  static async delete (req: Request, res: Response) {
    const { id } = req.params

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    const task = await Task.findOneBy({id: Number(id)})
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' })
    }

    await task.remove()
    return res.status(204).json() // Vamos retornar 204 pois não temos conteúdo para retornar
  }
```

Vamos criar uma rota para atualizar uma task no arquivo src/routes/task/task.routes.ts
```typescript
taskRoutes.put('/:id', TaskController.update) // usamos o put para atualizar todos os campos
```

E o método update no controller src/controllers/task/task.controller.ts
```typescript
  static async update (req: Request, res: Response) {
    const { id } = req.params
    const { title, completed } = req.body

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    const task = await Task.findOneBy({id: Number(id)})
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' })
    }

    task.title = title || task.title
    task.completed = (completed === undefined) ? task.completed : completed
    await task.save()

    return res.json(task) // Vamos retornar a task atualizada
  }
```

### Etapa 7 - Configurando o build

Ajustamos o tsconfig.json para gerar o build
```json
"outDir": "./dist",
"rootDir": "./src",
```

Adicionamos a pasta dist no .gitignore
```gitignore
node_modules
.env
dist
```

Ajustamos o package.json para fazer o build
```json
"scripts": {
    "dev": "nodemon --exec ts-node-dev src/server.ts",
    "build": "tsc"
  },
```

### Etapa 8 - Deploy

Antes do deploy vamos fazer um pequeno ajuste para o build, no arquivo ormconfig.js
```typescript
const dataBase = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || './src/database/database.sqlite',
  entities: [
    join(__dirname, '..', 'models/*.{ts,js}')
  ],
  logging: true,
  synchronize: true
})
```

A alteração foi para corrigir o caminho das entidades ao realizar o build
```typescript
join(__dirname, '..', 'models/*.{ts,js}')
```

Para o deploy vamos utilizar o Render, depois de criar a conta utilizando o Github vamos selecionar a opção Web Services
![image](https://github.com/felipez3r0/workshop-node-ts-intro/assets/7429615/d4da0a76-00f0-40e4-bfe2-44accd341794)

Vamos ajustar alguns pontos da configuração para garantir o build da aplicação
![image](https://github.com/felipez3r0/workshop-node-ts-intro/assets/7429615/611fefa4-61dd-4ca9-8c5e-db102d41c002)

### Etapa 9 - CORS

Vamos adicionar o CORS para permitir que nossa API seja acessada por outros domínios
```shell
yarn add cors @types/cors
```

Ajustamos o arquivo src/server.ts para utilizar o CORS
```typescript
import cors from 'cors'
app.use(cors()) // habilita o CORS
```

Isso vai permitir que nossa API seja acessada por qualquer domínio, mas também podemos configurar para permitir apenas alguns domínios
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://meuapp.com']
}))
```

Outra forma de ajustar o CORS seria utilizando o proxy reverso do Nginx ou algo nessa linha, mas isso fica para outro workshop :)

### Etapa 10 - Criando uma autenticação básica

Podemos realizar o processo de autenticação de diversas formas, aqui vamos construir uma autenticação simples utilizando um Token e um Refresh Token
Vamos começar criando a entidade User - user.entity.ts
```typescript
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  password!: string
}
```

Vamos ter também uma entidade para controlar os tokens de acesso - token.entity.ts
```typescript
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import User from './user.entity'

@Entity()
export default class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  token!: string

  @Column()
  refreshToken!: string

  @Column()
  expiresAt!: Date  

  @Column()
  userId!: number

  @ManyToOne(() => User, user => user.tokens)
  user!: User
}
```

Vamos adicionar a relação entre as entidades no arquivo user.entity.ts
```typescript
@OneToMany(() => Token, token => token.user)
tokens!: Token[]
```

Para gerar os hashs vamos utilizar o bcrypt - vamos adicionar ao projeto
```shell
yarn add bcrypt @types/bcrypt
```

Agora vamos criar o controller para as funções de autenticação - auth.controller.ts
```typescript
import { Request, Response } from 'express'
import User from '../../models/user.entity'
import Token from '../../models/token.entity'
import bcrypt from 'bcrypt'

export default class AuthController {
  static async store (req: Request, res: Response) {
    const { name, email, password } = req.body

    if (!name) return res.status(400).json({ error: 'O nome é obrigatório' })
    if (!email) return res.status(400).json({ error: 'O email é obrigatório' })
    if (!password) return res.status(400).json({ error: 'A senha é obrigatória' })

    const user = new User()
    user.name = name
    user.email = email
    // Gera a hash da senha com bcrypt - para não salvar a senha em texto puro
    user.password = bcrypt.hashSync(password, 10)
    await user.save()

    // Não vamos retornar a hash da senha
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    })
  }

  static async login (req: Request, res: Response) {
    const { email, password } = req.body

    if (!email) return res.status(400).json({ error: 'O email é obrigatório' })
    if (!password) return res.status(400).json({ error: 'A senha é obrigatória' })

    const user = await User.findOneBy({ email })
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

    const passwordMatch = bcrypt.compareSync(password, user.password)
    if (!passwordMatch) return res.status(401).json({ error: 'Senha inválida' })

    // Remove todos os tokens antigos do usuário
    await Token.delete(
      { user: { id: user.id } }
    )

    const token = new Token()
    // Gera um token aleatório
    token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
    // Define a data de expiração do token para 1 hora
    token.expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    // Gera um refresh token aleatório
    token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)

    token.user = user
    await token.save()

    return res.json({
      token: token.token,
      expiresAt: token.expiresAt,
      refreshToken: token.refreshToken
    })
  }

  static async refresh (req: Request, res: Response) {
    const { authorization } = req.headers

    if (!authorization) return res.status(400).json({ error: 'O refresh token é obrigatório' })

    const token = await Token.findOneBy({ refreshToken: authorization })
    if (!token) return res.status(401).json({ error: 'Refresh token inválido' })

    // Verifica se o refresh token ainda é válido
    if (token.expiresAt < new Date()) {
      await token.remove()
      return res.status(401).json({ error: 'Refresh token expirado' })
    }

    // Atualiza os tokens
    token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
    token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
    token.expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await token.save()

    return res.json({
      token: token.token,
      expiresAt: token.expiresAt,
      refreshToken: token.refreshToken
    })
  }

  static async logout (req: Request, res: Response) {
    const { authorization } = req.headers
    
    if (!authorization) return res.status(400).json({ error: 'O token é obrigatório' })

    // Verifica se o token existe
    const userToken = await Token.findOneBy({ token: authorization })
    if (!userToken) return res.status(401).json({ error: 'Token inválido' })

    // Remove o token
    await userToken.remove()

    // Retorna uma resposta vazia
    return res.status(204).json()
  }
}
```

Vamos criar as rotas para as funções de autenticação - auth.routes.ts
```typescript
import { Router } from 'express'
import AuthController from '../../controllers/auth/auth.controller'

const authRoutes = Router()

authRoutes.post('/register', AuthController.store)
authRoutes.post('/login', AuthController.login)
authRoutes.post('/refresh', AuthController.refresh)
authRoutes.post('/logout', AuthController.logout)

export default authRoutes
```

Com as rotas de autenticação criadas vamos ajustar o arquivo src/routes/index.ts
```typescript
import authRoutes from './auth/auth.routes'
routes.use('/auth', authRoutes)
```

Agora vamos criar um middleware para validar o token - middlewares/auth.middleware.ts
```typescript
import { Request, Response, NextFunction } from 'express'
import Token from '../models/token.entity'

export default async function authMiddleware (req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers

  if (!authorization) return res.status(401).json({ error: 'Token não informado' })

  // Verifica se o token existe
  const userToken = await Token.findOneBy({ token: authorization })
  if (!userToken) return res.status(401).json({ error: 'Token inválido' })

  // Verifica se o token expirou
  if (userToken.expiresAt < new Date()) {
    await userToken.remove()
    return res.status(401).json({ error: 'Token expirado' })
  }

  // Adiciona o id do usuário no header da requisição
  req.headers.userId = userToken.userId.toString()

  // Continua a execução
  next()
}
```

Agora vamos proteger as rotas que precisam de autenticação - src/routes/task/task.routes.ts
```typescript
import authMiddleware from '../../middlewares/auth.middleware'
taskRoutes.get('/', authMiddleware, TaskController.index)
taskRoutes.get('/:id', authMiddleware, TaskController.show)
taskRoutes.post('/', authMiddleware, TaskController.store)
taskRoutes.put('/:id', authMiddleware, TaskController.update)
taskRoutes.delete('/:id', authMiddleware, TaskController.delete)
```

Se uma rota for chamada sem o Token no header da requisição o usuário vai receber um erro devido a checagem do Middleware

### Etapa 11 - Tasks por usuários

Vamos adicionar a relação entre as entidades no arquivo task.entity.ts
```typescript
@Column({name: 'user_id'})
userId!: number

@ManyToOne(() => User, user => user.tasks)
user!: User
```

Vamos adicionar a relação entre as entidades no arquivo user.entity.ts
```typescript
@OneToMany(() => Task, task => task.user)
tasks!: Task[]
```

No Middleware de autenticação estamos passando o ID do usuário logado de acordo com seu token
```typescript
  // Adiciona o id do usuário no header da requisição
  req.headers.userId = userToken.userId.toString()
```

Vamos adicionar o ID do usuário na criação da task - src/controllers/task/task.controller.ts
```typescript
  static async store (req: Request, res: Response) {
    const { title, completed } = req.body
    const { userId } = req.headers

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    if (!title) {
      return res.status(400).json({ error: 'O título é obrigatório' })
    }

    const task = new Task()
    task.title = title
    task.completed = completed ?? false
    task.userId = Number(userId)
    await task.save()

    return res.status(201).json(task)
  }
```

Vamos adicionar o ID do usuário na listagem das tasks - src/controllers/task/task.controller.ts
```typescript
  static async index (req: Request, res: Response) {
    const { userId } = req.headers

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const tasks = await Task.find({where: { userId: Number(userId) }})
    return res.json(tasks)
  }
```

Vamos adicionar o ID do usuário na busca de uma task - src/controllers/task/task.controller.ts
```typescript
  static async show (req: Request, res: Response) {
    const { id } = req.params
    const { userId } = req.headers

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const task = await Task.findOneBy({id: Number(id), userId: Number(userId)})
    return res.json(task)
  }
```

Vamos adicionar o ID do usuário na atualização de uma task - src/controllers/task/task.controller.ts
```typescript
  static async update (req: Request, res: Response) {
    const { id } = req.params
    const { title, completed } = req.body
    const { userId } = req.headers

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const task = await Task.findOneBy({id: Number(id), userId: Number(userId)})
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' })
    }

    task.title = title ?? task.title
    task.completed = (completed === undefined) ? task.completed : completed
    await task.save()

    return res.json(task)
  }
```

Vamos adicionar o ID do usuário na remoção de uma task - src/controllers/task/task.controller.ts
```typescript
  static async delete (req: Request, res: Response) {
    const { id } = req.params
    const { userId } = req.headers

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const task = await Task.findOneBy({id: Number(id), userId: Number(userId)})
    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' })
    }

    await task.remove()
    return res.status(204).json()
  }
```

### Etapa 12 - Ajusta email para ser único

O campo email da entity User não está configurado como um campo único, isso vai permitir dois cadastros com o mesmo e-mail e pode bagunçar os acessos as tarefas.

Para corrigir o problema podemos ajustar a entity adicionando a informação de campo único e também fazer a verificação no controller

Entidade - user.entity.ts
```typescript
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm'
import Token from './token.entity'
import Task from './task.entity'

@Entity()
@Unique(["email"])
export default class User extends BaseEntity {
```

Controller - auth.controller.ts
```typescript
export default class AuthController {
  static async store (req: Request, res: Response) {
    const { name, email, password } = req.body

    if (!name) return res.status(400).json({ error: 'O nome é obrigatório' })
    if (!email) return res.status(400).json({ error: 'O email é obrigatório' })
    if (!password) return res.status(400).json({ error: 'A senha é obrigatória' })

    // Verifica se o email já está cadastrado
    const userCheck = await User.findOneBy({ email })
    if (userCheck) return res.status(400).json({ error: 'Email já cadastrado' })
```
