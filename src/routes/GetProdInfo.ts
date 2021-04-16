import {FastifyReply, FastifyRequest} from 'fastify';
import {BaseRoute} from '../structures/routes/BaseRoute.js';
import {MongoClient} from 'mongodb';
import {Logger} from '../structures/logger/Logger.js';

/**
 * Product Info Route
 * @public
 */
export default class GetProdInfo extends BaseRoute {
  constructor(mongo: MongoClient, logger: Logger) {
    super({url: '/info', method: 'GET', meta: 'Product Info'}, mongo, logger);
  }

  /**
   * Handler for getting product info
   * @override
   * @public
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helper
   */
  async handler(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const productName = (req.query as {productName?: string}).productName;
    if (productName) {
      const product = await this.mongo
        .db(`${process.env['DB_PRODUCTS']}`)
        .collection(`${process.env['COLLECTION_PRODUCTS']}`)
        .findOne({productName});
      product
        ? res.status(200).send({result: 'Product found!', product})
        : res.status(404).send({error: 'Product not found!'});
      return;
    }
    res.status(400).send();
  }
}
