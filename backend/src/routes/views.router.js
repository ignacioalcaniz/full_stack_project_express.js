import { Router } from "express";
import { productDaoMongo } from "../daos/product.dao.js";
import { CartDao } from "../daos/cart.dao.js";


export const viewRoutes=Router();



viewRoutes.get("/", async (req, res) => {
    try {

        const products = await productDaoMongo.getAll(); 

        
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos" });
        }

        
        const cleanedProducts = products.map(product => {
            const { _id, __v, ...rest } = product.toObject();
            return rest;
        });

        
        res.render("index", { products: cleanedProducts });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los productos", error: error.message });
    }
});




viewRoutes.get("/carrito",async(req,res)=>{
    try {
        const cart=await  CartDao.getAll()
        res.render("carrito",{cart})
    } catch (error) {
        res.status(500).send("Error al obtener los productos del carrito");
    }
})