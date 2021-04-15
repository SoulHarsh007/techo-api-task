import {FastifyReply, FastifyRequest} from 'fastify';
import {BaseRoute} from '../structures/routes/BaseRoute.js';
import {MongoClient} from 'mongodb';
import {Logger} from '../structures/logger/Logger.js';

/**
 * Cart Route
 * @public
 */
export default class AddToCart extends BaseRoute {
  constructor(mongo: MongoClient, logger: Logger) {
    super({url: '/cart', method: 'POST', meta: 'Add To Cart'}, mongo, logger);
  }

  /**
   * Handler for adding products to cart
   * @override
   * @public
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helper
   */
  async handler(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const body = req.body as {
      user: string;
      productName: string;
      productQty: number;
    };
    if (!body.user || !body.productName || !body.productQty)
      return res.status(400).send({error: 'Missing fields!'});
    const userData: {
      cart?: {productName: string; productQty: number}[];
    } = await this.mongo
      .db(`${process.env['DB_USERS']}`)
      .collection(`${process.env['COLLECTION_USERS']}`)
      .findOne({user: body.user});
    if (!userData) return res.status(404).send({error: 'User Not Found!'});
    const cartHasItem = userData.cart?.filter(
      (x: {productName: string; productQty: number}) =>
        x.productName === body.productName
    );
    cartHasItem?.length
      ? (userData.cart = userData.cart?.map(
          (x: {productName: string; productQty: number}) => {
            x.productName === body.productName
              ? (x.productQty += body.productQty)
              : undefined;
            return x;
          }
        ))
      : userData.cart?.push({
          productName: body.productName,
          productQty: body.productQty,
        });
    this.mongo
      .db(`${process.env['DB_USERS']}`)
      .collection(`${process.env['COLLECTION_USERS']}`)
      .updateOne({user: body.user}, {$set: userData}, {upsert: true});
    res.status(200).send({result: 'Product added!', cart: userData.cart});
  }
}
