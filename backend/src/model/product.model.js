import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

export const productsCollectionName = "products";

const ProductSchema = new Schema({
    nombre: { type: String, required: true, index: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    imagen:{type:String,required:true},
    categoria:{type:String,required:true},
    
 
    
});
ProductSchema.plugin(mongoosePaginate)

export const ProductModel = model(productsCollectionName, ProductSchema);