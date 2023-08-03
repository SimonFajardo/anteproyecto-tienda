import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

//REGISTRAR USUARIO
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //VALIDAR CAMPOS
    if (!name) {
      return res.send({ error: "Nombre es requerido" });
    }
    if (!email) {
      return res.send({ message: "Email es requerido" });
    }
    if (!password) {
      return res.send({ message: "Clave es requerida" });
    }
    if (!phone) {
      return res.send({ message: "Telefono es requerido" });
    }
    if (!address) {
      return res.send({ message: "Dirección es requerida" });
    }
     
    //VALIDAR USUARIO
    const exisitingUser = await userModel.findOne({ email });
    //CONSULTAR SI ESTE USUARIO YA EXISTE
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Este usuario ya está registrado",
      });
    }
    //ENCRIPTAR CONTRASEÑA
    const hashedPassword = await hashPassword(password);
    //GUARDAR
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword, 
    }).save();

    res.status(201).send({
      success: true,
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al registrar",
      error,
    });
  }
};

//INICIAR SESIÓN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //VALIDAR QUE LOS CAMPOS NO VENGAN VACÍOS
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Email o contraseña invalida",
      });
    }
    //CONSULTAR SI EL USUARIO EXISTE 
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email o contraseña invalida",
      });
    }

    //Comparar contraseña
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Clave invalida",
      });
    }
    //GENERAR TOKEN
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Inicio de sesión",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//EDITAR CLAVE

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Emai is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//TEST DE PRUEBA
export const testController = (req, res) => {
  try {
    res.send("Protección de ruta");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//ACTUALIZAR PERFIL
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //CONTRASEÑA
    if (password && password.length < 6) {
      return res.json({ error: "La clave debe tener más de 6 caracteres" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Perfil actualizado correctamente",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error al actualizar perfil",
      error,
    });
  }
};

//OBTENER ORDEN
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name email phone");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al traer ordenes",
      error,
    });
  }
};
//OBNERER ORDENES
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name email phone" ) 
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al traer ordenes",
      error,
    });
  }
};

//ESTADO DE LA ORDEN
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
