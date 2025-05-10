import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QNames } from './__defs__/queue.dto';

/**
 * Registers a queue with the given name using BullMQ and BullBoard.
 * @param {string} name - The name of the queue to register.
 * @returns {Array} An array containing BullModule and BullBoardModule configurations.
 */
export function registerQueue(name: string) {
  return [
    BullModule.registerQueue({
      name,
    }),
    BullBoardModule.forFeature({
      name,
      adapter: BullMQAdapter,
    }),
  ];
}

/**
 * Registers all named queues provided in the qName object.
 * @param {typeof QNames} qName - An object containing queue names.
 * @returns {Array} An array of configurations for all registered queues.
 */
export function registerAllNamedQueues(qName: typeof QNames) {
  const queueNames = Object.values(qName);
  return queueNames.map((name) => registerQueue(name)).flat();
}
