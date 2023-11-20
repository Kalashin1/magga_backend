import { Product } from "../../entity/product";
import ProductService from '../../services/products';
import { Request, Response } from "express";
import tradeService from "../../services/trades";
import positionService from "../../services/position";


export const createProduct = async (req: Request, res: Response) => {
  const {payload} = req.body;
  try {
    const product = await ProductService.create(payload);
    return res.json(product)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getProductById = async(req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const product = await ProductService.getProductById(id);
    return res.json(product)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getStoreProducts = async (req: Request, res: Response) => {
  const {shop} = req.params;
  console.log(req.params);
  try {
    const products = await ProductService.getShopProducts(shop);
    console.log(products)
    const payload = await Promise.all(products.map(async (product) => {
      const trade = await tradeService.retrieveTrade(product.category);
      const position = await positionService.getPositionByExternalId(product.subCategory)
      return { ...product, category: trade, subCategory: position}
    }))
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateProduct = async (req: Request, res: Response) =>  {
  const {product_id} = req.params;
  const {product} = req.body;
  try {
    const products = await ProductService.update(product_id, product);
    return res.json(products);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const deleteProduct = async (req: Request, res: Response) =>  {
  const {product_id} = req.params;
  try {
    const payload = await ProductService.deleteProduct(product_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}