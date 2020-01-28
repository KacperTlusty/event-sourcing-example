import { Order } from "./model"
import { Command } from "./types"
import { OrderRepository } from "./repository"

async function createOrder (repository: OrderRepository, command: Command): Promise<void> {
  if (await repository.getById(command.id)) {
    throw new Error('Order already exists.')
  }
  const order = new Order()
  await order.create(command.id)
  await repository.saveEvents(order)
}

async function finishOrder (repository: OrderRepository, command: Command): Promise<void> {
  const order = await repository.getById(command.id)
  if (!order) {
    throw new Error('Order does not exists')
  }  
  order.finish()
  await repository.saveEvents(order)
}

async function addItems (repository: OrderRepository, command: Command): Promise<void> {
  const order = await repository.getById(command.id)
  if (!order) {
    throw new Error('Order does not exist')
  }
  order.addItems(command.payload.items)
  await repository.saveEvents(order)
}

async function removeItems (repository: OrderRepository, command: Command): Promise<void> {
  const order = await repository.getById(command.id)
  if (!order) {
    throw new Error('Order does not exists')
  }
  
  order.removeItems(command.payload.items)
  await repository.saveEvents(order)
}

export async function makeHandlers () {
  const repository = new OrderRepository()
  await repository.connect()
  await repository.loadEvents()
  const commandHandlers: {
    [key: string]: (command: Command) => void | Promise<void>
  } = {
    'CreateOrder': (command) => createOrder(repository, command),
    'FinishOrder': (command) => finishOrder(repository, command),
    'AddItemsToOrder': (command) => addItems(repository, command),
    'RemoveItemsFromOrder': (command) => removeItems(repository, command)
  }

  return async function handleCommand(command: Command): Promise<void> {
    await commandHandlers[command.name](command)
  }
}
