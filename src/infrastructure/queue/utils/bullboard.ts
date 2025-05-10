import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

async function basicAuthMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Basic ')) {
    reply.header('WWW-Authenticate', 'Basic realm="Queues Access"');
    return reply.status(401).send('Authentication required');
  }

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii',
  );
  const [username, password] = credentials.split(':');

  const validUser = process.env.BULLMQ_DASHBOARD_USER || 'admin';
  const validPass = process.env.BULLMQ_DASHBOARD_PASSWORD || 'admin';

  if (username === validUser && password === validPass) {
    return;
  }

  reply.header('WWW-Authenticate', 'Basic realm="Queues Access"');
  return reply.status(401).send('Invalid credentials');
}

export function setUpBullBoardAuth(fastify: FastifyInstance) {
  const dashboardRoute = process.env.BULLMQ_DASHBOARD_ROUTE || '/admin/queues';

  fastify.addHook('onRequest', async (req, reply) => {
    if (req.url.startsWith(dashboardRoute)) {
      await basicAuthMiddleware(req, reply);
    }
  });
}
