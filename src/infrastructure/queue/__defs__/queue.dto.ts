/**
 * ⚠️⚠️⚠️
 * QNames is a constant object that defines the names of the queues used in the application.
 * These names are crucial for identifying and managing different job queues.
 *
 * When adding a new queue, ensure to add its name to this object to maintain consistency.
 * This helps in maintaining a clear understanding of the application's queue structure.
 *
 * If you're unsure about the best practice for adding a new queue, refer to the existing queue names
 * in this object for guidance.
 *
 * ⚠️⚠️⚠️
 */
export const QNames = {
  default: 'app__default',
  sendMail: 'app__send-mail',
} as const;

type ValueOf<T> = T[keyof T];

export type QNames = ValueOf<typeof QNames>;
