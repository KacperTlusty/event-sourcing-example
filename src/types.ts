export interface Command {
  name: string;
  id: string;
  payload: any;
}

export interface EventMessage {
  name: string;
  index: number;
  payload: any;
  id: string;
}

export interface CommandHandler {
  handle: (command: Command) => void;
}

export interface AggregateRoot {
  id: string;
  version: number;
  apply: (event: EventMessage) => void;
  register: (name: string, handler: (event: EventMessage) => void) => void;
}
