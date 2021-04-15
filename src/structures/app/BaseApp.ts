import {fastify, FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import multipartHandler from 'fastify-multipart';
import {readdirSync} from 'fs';
import mongodb from 'mongodb';
import {Logger} from '../logger/Logger.js';
import {BaseRoute} from '../routes/BaseRoute.js';
import {inspect} from 'util';

/**
 * Base fastify app
 * @public
 */
export class BaseApp {
  public app: FastifyInstance;
  public logger: Logger;
  public mongo: mongodb.MongoClient;

  constructor() {
    this.app = fastify();
    this.logger = new Logger();
    this.mongo = new mongodb.MongoClient(`${process.env['MONGO_URL']}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  }

  /**
   * Setups api routes and enables all required middleware for fastify server instance
   * @public
   * @sealed
   */
  async setup(): Promise<void> {
    this.logger.log('Connecting MongoDB...', 'INFO', 'MongoDBLoader');
    await this.mongo.connect();
    this.logger.log('MongoDB Connected', 'INFO', 'MongoDBLoader');
    this.app.decorate('mongo', this.mongo);
    this.app.decorate('logger', this.logger);
    this.app.setErrorHandler(
      (error: Error, req: FastifyRequest, res: FastifyReply) => {
        this.logger.log(error, 'Error', 'ServerError');
        this.logger.log(req, 'DEBUG', 'DEBUG');
        res.status(500).send();
      }
    );
    this.app.register(multipartHandler, {limits: {files: 1}});
    const routes = readdirSync(`${process.cwd()}/dist/routes/`).filter(x =>
      x.endsWith('.js')
    );
    for await (const route of routes) {
      const {default: Route} = await import(
        `${process.cwd()}/dist/routes/${route}`
      );
      const APIRoute: BaseRoute = new Route(this.mongo, this.logger);
      this.logger.log(
        `Loading API Route: ${APIRoute.meta}`,
        'INFO',
        'RouteLoader'
      );
      this.logger.log(
        `RouteURL: ${APIRoute.meta} - ${APIRoute.url}`,
        'INFO',
        'RouteLoader'
      );
      this.logger.log(
        `RouteMethod: ${APIRoute.meta} - ${APIRoute.method}`,
        'INFO',
        'RouteLoader'
      );
      this.app.route({
        url: APIRoute.url,
        method: APIRoute.method,
        handler: APIRoute.handler,
        onSend: this.onSend,
      });
      this.logger.log(
        `Loaded API Route: ${APIRoute.meta}`,
        'INFO',
        'RouteLoader'
      );
    }
    this.app.listen(
      `${process.env['PORT']}`,
      '0.0.0.0',
      (err: Error, address: string) => {
        err
          ? this.logger.log(err, 'FastifyError', 'FastifyError')
          : this.logger.log(
              `Fastify running on: ${address}`,
              'INFO',
              'Fastify'
            );
      }
    );
  }
  /**
   * onSend handler for additional logging of outgoing request
   * @public
   * @sealed
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helpers
   * @param payload - Outgoing response payload
   * @param done - Function to call when everything is processed
   */
  onSend(
    req: FastifyRequest,
    res: FastifyReply,
    payload: unknown,
    done: VoidFunction
  ): void {
    this.logger.log(
      `Incoming request body: ${inspect(req.body, true)} from ${req.ip}`,
      'INFO',
      'RequestLogger'
    );
    this.logger.log(
      `Incoming request query: ${inspect(req.query, true)} from ${req.ip}`,
      'INFO',
      'RequestLogger'
    );
    this.logger.log(
      `Outgoing response body: ${inspect(payload, true)}`,
      'INFO',
      'ResponseLogger'
    );
    this.logger.log(
      `Outgoing response statusCode: ${res.statusCode}`,
      'INFO',
      'ResponseLogger'
    );
    done();
  }
}
