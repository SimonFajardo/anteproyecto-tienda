import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//OBJETO RUTA
const router = express.Router();

//ENPOINTS
//REGISTRAR USUARIO
router.post("/register", registerController);

//INICIA SESIÓN
router.post("/login", loginController);



//PROBAR AUTETICACIÓN DE RUTA
router.get("/test", requireSignIn, isAdmin, testController);

//PROTEGER RUTA
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//PROTEGER RUTA ADMIN
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//ACTUALIZAR PERFIL
router.put("/profile", requireSignIn, updateProfileController);

//OBTENER ORDENES DE CLIENTE
router.get("/orders", requireSignIn, getOrdersController);

//OBTENER TODAS LAS ORDES PARA ADMINISTRADOR 
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// ACTUALIZAR ESTADO DE LA ORDEN
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
