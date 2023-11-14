import { Product } from "../../entity/product";
import ProductService from '../../services/products';
import { Request, Response } from "express";


export const createProduct = async (req: Request, res: Response) => {
  const {param} = req.body;
  try {
    const product = await ProductService.create(param);
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
  const {store} = req.params;
  try {
    const products = await ProductService.getShopProducts(store);
    return res.json(products);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}