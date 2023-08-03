import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";


import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//PASARELA DE PAGO
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, category, variations, keywords } =
      req.fields;
    const { photo } = req.files;
    //VALIDACIONES
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Nombre es requerido" });
      case !description:
        return res.status(500).send({ error: "Marca es requerido" });
       
      case !category:
        return res.status(500).send({ error: "Categoria es requerido" });
      case variations:
        return res.status(500).send({ error: "La talla, precio y cantidad son obligatorias" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "La foto no puede pesar más de 1MB" });
    }

    const parsedVariations = JSON.parse(variations);
    const parsedKeywords = JSON.parse(keywords);


    const products = new productModel({ ...req.fields, slug: slugify(name),  variations: parsedVariations, keywords: parsedKeywords});
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Producto creado correctamente",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error al crear producto",
    });
  }
};

//TRAER TODOS LOS PRODUCTOS
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(99)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al traer productos",
      error: error.message,
    });
  }
};
// OBTENER UN PRODUCTO EN PARTICULAR
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Producto partícular",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al traer prducto",
      error,
    });
  }
};

//OBTENER FOTO
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al traer foto",
      error,
    });
  }
};

//ELIMINAR PRODUCTO
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//ACTUALIZAR PRODUCTO
export const updateProductController = async (req, res) => {
  try {
    const { name, description, category, variations } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Nombre es requerido" });
      case !description:
        return res.status(500).send({ error: "Marca es requerido" });
       
      case !category:
        return res.status(500).send({ error: "Categoria es requerido" });
      case variations:
        return res.status(500).send({ error: "La talla, precio y cantidad son obligatorias" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "La foto no puede pesar más de 1MB" });
    }
    const parsedVariations = JSON.parse(variations);
     

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name),  variations: parsedVariations, },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Producto actualizado correctamente",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error al actualizar producto",
    });
  }
};

// FILTROS
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category =  checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// CONTAR PRODUCTOS
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// LISTA DE PRODUCTOS EN UNA PÁGINA
export const productListController = async (req, res) => {
  try {
    const perPage = 22;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

//BUSCAR UN PRODUCTO 
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } }, 
          { keywords: { $in: [keyword] } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// PRODUCTOS SIMILARES
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// oBTENER PRODUCTO POR CATEGORÍA
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//LLAMADA A LA API DE PAGO
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
       
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};




// ...

export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          });
          await order.save();

          // Actualizar la cantidad de productos en la base de datos
          await Promise.all(
            cart.map(async (item) => {
              const product = await productModel.findOneAndUpdate(
                { _id: item._id, "variations.size": item.size },
                { $inc: { "variations.$.quantity": -item.quantity } },
                { new: true }
              );
            })
          );

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};


//Gestionar pago
{/*

 export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    console.log({cart})
    let total = 0;
    cart.map((i) => {
      const itemTotal = i.price * i.quantity;
        total += itemTotal;
    });

     
 
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();

           

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }


      }
    );
  } catch (error) {
    console.log(error);
  }
};
*/}