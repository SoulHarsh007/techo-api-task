import {FastifyReply, FastifyRequest} from 'fastify';
import {BaseRoute} from '../structures/routes/BaseRoute.js';
import {MongoClient} from 'mongodb';
import {Logger} from '../structures/logger/Logger.js';

/**
 * Cart Route
 * @public
 */
export default class GetCart extends BaseRoute {
  constructor(mongo: MongoClient, logger: Logger) {
    super({url: '/cart', method: 'GET', meta: 'Get Cart'}, mongo, logger);
  }

  /**
   * Handler for getting products from cart
   * @override
   * @public
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helper
   */
  async handler(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const body = req.query as {
      user: string;
    };
    if (!body.user) return res.status(400).send({error: 'Missing User Field!'});
    const userData: {
      cart?: {productName: string; productQty: number}[];
    } = await this.mongo
      .db(`${process.env['DB_USERS']}`)
      .collection(`${process.env['COLLECTION_USERS']}`)
      .findOne({user: body.user});
    if (!userData) return res.status(404).send({error: 'User Not Found!'});
    res.status(200).send({result: 'User cart found!', cart: userData.cart});
  }
}
