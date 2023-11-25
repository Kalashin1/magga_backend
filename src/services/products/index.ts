import { Product } from "../../entity/product";
import { AppDataSource } from "../../data-source";
import { ObjectId } from "mongodb";
import userService from "../user";
import notificationService from "../notifications";
import XLSX from 'xlsx';
class ProductService {
  async create(param: Product) {
    const shop = await userService.getUser({ _id: param.shop });
    if (!shop) throw Error("No shop with that ID!");

    const product = await this.save(
      AppDataSource.mongoManager.create(Product, param)
    );
    await notificationService.create(
      "New Product Added",
      "PRODUCT",
      shop._id.toString(),
      product._id.toString()
    );
    return product;
  }

  getShopProducts(shop_id: string) {
    return AppDataSource.mongoManager.find(Product, {
      where: {
        shop: {
          $eq: shop_id,
        },
      },
      order: {
        category: "ASC",
      },
    });
  }

  getProductById(id: string) {
    return AppDataSource.mongoManager.findOne(Product, {
      where: {
        _id: {
          $eq: new ObjectId(id),
        },
      },
    });
  }

  save(product: Product) {
    return AppDataSource.mongoManager.save(Product, product);
  }

  async update(id: string,{price, name, description, imageUrls}: Partial<Product>) {
   const product = await this.getProductById(id);
    if (!product) throw Error('Product not found');
    if (price) product.price = price;
    if (name) product.name = name;
    if (description) product.description = description;
    if (imageUrls) product.imageUrls = imageUrls;
    return this.save(product);
  }

  async deleteProduct(id: string){
    const product = await this.getProductById(id);
    return await AppDataSource.getMongoRepository(Product).deleteOne({...product})
  }

  async uploadMultipleProducts(shop_id: string, file: Buffer){
    const workbook = XLSX.read(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as Partial<Product[]>;
    const shop = await userService.getUser({ _id: shop_id })
    data.forEach((product) => {
      product.shop = shop_id
    });
    const createdProducts = await Promise.all(data.map((product) => this.create(product)));
    return createdProducts;
  }
}

export default new ProductService();
