import { ProductModel } from "../model/product.model.js";
import MongoDao from "./mongo.dao.js";






class ProductDaoMongo extends MongoDao {
    constructor(model) {
        super(model);
    }
}

export const productDaoMongo = new ProductDaoMongo(ProductModel);



