import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QNames } from './__defs__/queue.dto';

@Injectable()
export class QueueService {
  private readonly queueMap: Record<QNames, Queue>;

  constructor(
    @InjectQueue(QNames.default) private readonly defaultQueue: Queue,
    @InjectQueue(QNames.sendMail) private readonly sendMailQueue: Queue,
  ) {
    this.queueMap = {
      [QNames.default]: this.defaultQueue,
      [QNames.sendMail]: this.sendMailQueue,
    };
  }

  async #addJob(queue: Queue, jobName: string, data: any) {
    await queue.add(jobName, data);
  }

  async #addBulkJob(
    queue: Queue,
    data: {
      name: string;
      data: any;
    }[],
  ) {
    await queue.addBulk(data);
  }

  async addToQueue<T>(input: { queueName: QNames; data: T }) {
    const queue = this.queueMap[input.queueName];

    if (!queue) {
      throw new Error(`Queue with name ${input.queueName} not found.`);
    }

    return this.#addJob(queue, input.queueName, input.data);
  }

  async addBulkToQueue<T>(input: {
    queueName: QNames;
    jobs: { name: string; data: T }[];
  }) {
    const queue = this.queueMap[input.queueName];

    if (!queue) {
      throw new Error(`Queue with name ${input.queueName} not found.`);
    }

    return this.#addBulkJob(queue, input.jobs);
  }
}
