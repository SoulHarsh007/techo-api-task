import {MongoClient} from 'mongodb';
import {Logger} from '../logger/Logger.js';
import {FastifyReply, FastifyRequest} from 'fastify';

/**
 * Custom class representing a api route
 * @public
 */
export class BaseRoute {
  public url: string;
  public method:
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'OPTIONS';
  public meta: string | undefined;
  public mongo: MongoClient;
  public logger: Logger;

  constructor(
    data: {
      url: string;
      method: 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS';
      meta: string;
    },
    mongo: MongoClient,
    logger: Logger
  ) {
    this.url = data.url;
    this.method = data.method;
    this.meta = data.meta;
    this.mongo = mongo;
    this.logger = logger;
  }

  /**
   * Handler for incoming requests, override and use for api routes
   * @public
   * @virtual
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helpers
   */
  async handler(req: FastifyRequest, res: FastifyReply): Promise<void> {
    console.log(req, res);
  }
}
