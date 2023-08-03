import express from "express";
import {
  brainTreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  realtedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);
//routes
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//OBTENER PRODUCTO
router.get("/get-product", getProductController);

//OBTENER PRODUCTO INDIVIDUAL
router.get("/get-product/:slug", getSingleProductController);

//OBTENER IMAGEN
router.get("/product-photo/:pid", productPhotoController);

//ELIMINAR PRODUCTO
router.delete("/delete-product/:pid", deleteProductController);

//FILTRAR PRODUCTOS
router.post("/product-filters", productFiltersController);

//CONTAR PRODUCTOS
router.get("/product-count", productCountController);

//PRODUCTOS POR PAGINA
router.get("/product-list/:page", productListController);

//BUSCAR PRODUCTO
router.get("/search/:keyword", searchProductController);

//BUSCAR PRODUCTOS SIMILARES
router.get("/related-product/:pid/:cid", realtedProductController);

//A QUE CATEGORÍA PERTENECE UN PRODUCTO
router.get("/product-category/:slug", productCategoryController);

//RUTA DE PAGOS
//OBTENER TOKEN
router.get("/braintree/token", braintreeTokenController);

//REALIZAR PAGO
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

export default router;
