import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm'
import Token from './token.entity'
import Task from './task.entity'

@Entity()
@Unique(["email"])
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  password!: string

  @OneToMany(() => Token, token => token.user)
  tokens!: Token[]  

  @OneToMany(() => Task, task => task.user)
  tasks!: Task[]  
}