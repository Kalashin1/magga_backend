import { Product } from "../../entity/product";
import { AppDataSource } from "../../data-source";
import { ObjectId } from "mongodb";
import userService from "../user";
import notificationService from "../notifications";

class ProductService {
  async create(param: Product) {
    const shop = await userService.getUser({ _id: param.shop });
    if (!shop) throw Error('No shop with that ID!');

    const product = await this.save(AppDataSource.mongoManager.create(Product, param))
    await notificationService.create(
      'New Product Added',
      'PRODUCT',
      shop._id.toString(),
      product._id.toString()
    );
    return product;
  }

  getShopProducts(shop_id: string) {
    return AppDataSource.mongoManager.find(Product, {
      where: {
        shop: {
          $eq: shop_id
        }
      },
      order: {
        category: 'ASC'
      }
    })
  }

  getProductById(id: string) {
    return AppDataSource.mongoManager.findOne(Product, {
      where: {
        _id: {
          $eq: new ObjectId(id)
        }
      }
    })
  }

  save(product: Product) {
    return AppDataSource.mongoManager.save(Product, product)
  }
}

export default new ProductService();