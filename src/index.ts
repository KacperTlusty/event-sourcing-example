import env from 'dotenv'
import { Command } from "./types"
import { makeHandlers } from "./handlers"
import { getAggregates } from './repository'

import cuid = require("cuid")

env.config()

const command1: Command = {
  id: '',
  name: 'CreateOrder',
  payload: {}
}

makeHandlers().then(async (handler) => {
  // const id = cuid()
  // command1.id = id
  // await handler(command1)
  // console.log(getAggregates())
  // await handler({
  //   id,
  //   name: 'AddItemsToOrder',
  //   payload: {
  //     items: ['1', '2', '3']
  //   }
  // })
  // console.log(getAggregates())
  // await handler({
  //   id,
  //   name: 'RemoveItemsFromOrder',
  //   payload: {
  //     items: ['1', '2']
  //   }
  // })
  // console.log(getAggregates())
  // await handler({
  //   id,
  //   name: 'FinishOrder',
  //   payload: {}
  // })
  // console.log(getAggregates())
}).catch(error => {
  console.error(error)
})
