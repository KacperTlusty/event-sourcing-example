import { connect, Collection } from 'mongodb'
import { Order } from './model'
import { EventMessage } from './types'

export type Aggregates = {
  ORDER: { [key: string]: Order }
}

export const aggregates: Aggregates = {
  ORDER: {}
}

export function getAggregates() {
  return {
    ...aggregates.ORDER
  }
}

export class OrderRepository {
  collection?: Collection<EventMessage>

  async connect() {
    const {
      MONGO_URL,
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_DB,
      ORDER_EVENT_COLLECTION
    } = process.env
    const client = await connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URL}/test?retryWrites=true&w=majority`, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })

    this.collection = client.db(MONGO_DB).collection(`${ORDER_EVENT_COLLECTION}`)
  }

  async getById(id: string) {
    if (aggregates.ORDER[id]) {
      return aggregates.ORDER[id]
    }
    const events = await this.collection?.find({ id })
      .sort({ index: 1 })
      .toArray()
    if (events?.length === 0) {
      return null
    }
    const order = new Order()
    events?.forEach(event => order.apply(event))
    order.events = []
    return order
  }

  async saveEvents(order: Order) {
    const events = order.events
    await this.collection?.insertMany(events)
    order.events = []
    aggregates.ORDER[order.id] = order
  }
}
