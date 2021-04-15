import {FastifyReply, FastifyRequest} from 'fastify';
import {BaseRoute} from '../structures/routes/BaseRoute.js';
import {createWriteStream} from 'fs';
import {MongoClient} from 'mongodb';
import {Logger} from '../structures/logger/Logger.js';

/**
 * Product Info Route
 * @public
 */
export default class PostProdInfo extends BaseRoute {
  constructor(mongo: MongoClient, logger: Logger) {
    super({url: '/info', method: 'POST', meta: 'Product Info'}, mongo, logger);
  }

  /**
   * Handler for product info creation
   * @override
   * @public
   * @param req - Incoming request with default fastify middleware and helpers
   * @param res - Outgoing response with default fastify middleware and helper
   */
  async handler(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const data = await req.file();
    data.file
      ? data.file.pipe(
          createWriteStream(`${process.cwd()}/public/${data.filename}`)
        )
      : res.status(400).send({error: 'Missing Product Image'});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (data as any).fields;
    if (
      !data.fields['prod_name'] ||
      !data.fields['prod_desc'] ||
      !data.fields['prod_quantity'] ||
      !data.fields['prod_price']
    )
      return res.status(400).send();
    this.logger.log(
      {
        productName: fields['prod_name'].value,
        productDesc: fields['prod_desc'].value,
        productQty: parseInt(fields['prod_quantity'].value, 10),
        productPrice: parseFloat(fields['prod_price'].value),
        productImage: data.filename,
      },
      'INFO',
      'Product Added'
    );
    this.mongo
      .db(`${process.env['DB_PRODUCTS']}`)
      .collection(`${process.env['COLLECTION_PRODUCTS']}`)
      .insertOne({
        productName: fields['prod_name'].value,
        productDesc: fields['prod_desc'].value,
        productQty: parseInt(fields['prod_quantity'].value, 10),
        productPrice: parseFloat(fields['prod_price'].value),
        productImage: data.filename,
      });
    res.status(200).send({
      result: 'Product added!',
      product: {
        productName: fields['prod_name'].value,
        productDesc: fields['prod_desc'].value,
        productQty: parseInt(fields['prod_quantity'].value, 10),
        productPrice: parseFloat(fields['prod_price'].value),
        productImage: data.filename,
      },
    });
  }
}
