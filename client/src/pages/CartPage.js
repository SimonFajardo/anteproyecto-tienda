import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
 
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";
 
const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  //CALCULAR EL TOTAL 
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
      });
      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    } catch (error) {
      console.log(error);
    }
  };
  //REMOVER PRODUCTO
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  //TRAEMOS UN TOKEN PARA REALIZAR UN PAGO
  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getToken();
  }, [auth?.token]);

  //REALIZAMOS EL PAGO
  const handlePayment = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/api/v1/product/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Pago completado correctamente, gracias por su compra");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div className=" cart-page">
        <div className="row pt-20" >
          <div className=" col-md-12">
            <h1 className="text-center bg-light p-2 mb-1 pt-20">
              {!auth?.user
                ? "Hola de nuevo"
                : `Hola,  ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `Tienes ${cart.length} productos en tu carrito, ${
                      auth?.token ? "" : "Inicia sesión para continuar"
                    }`
                  : "Tú carrito está vacío"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container ">
          <div className="row pb-4">
            <div className="col-12 col-lg-8 col-xs-8 col-sm-8  mb-4">
            {cart?.map((p, index) => (
              <div className="row card flex-row  pb-4" key={index}>
                  <div className="col-3 col-md-2">
                      <img
                        src={`/api/v1/product/product-photo/${p._id}`}
                        className="card-img-top"
                        alt={p.name}
                        width="100%"
                        height={"130px"}
                      />
                 </div>
             <div className="col-7 col-md-6">
              <div className="row container d-flex justify-content-left">
                  <div className="col-6 col-sm-6">
                      <p><strong>Producto:</strong>  <br/>  {p.name}</p> 
                      <p><strong>Cantidad:</strong>  {p.quantity}</p>
                 
                  </div>
                 
                  <div className="col-6 col-sm-6">
                  <p><strong>Talla:</strong>  {p.size}</p>   
                 
                  <p><strong>Precio:</strong>  {p.price}</p>
                  </div>

              </div>
                 
            </div>
            <div className="col-1 col-sm-1 pt-1 cart-remove-btn">
              <button
               className="btn btn-danger"
               onClick={() => removeCartItem(p._id)}
              >
                 X
            </button>
    </div>
  </div>
))}
            </div>
            <div className="col-lg-3 col-xs-3 col-sm-3 cart-summary ">
              <h2>Resumen de Orden</h2>
              <p>Total | Verificación | Pago</p>
              <hr />
              <h4>Total: {totalPrice()}</h4> 
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Dirección</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Actualizar Dirección
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Actualizar Dirección
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Por favor, inicia sesión para continuar
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2 botonPago">
                {!clientToken || !auth?.token || !cart?.length ? (
                  ""
                ) : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: "vault",
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />

                    <button
                      className="btn btn-success "
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Cargando ...." : "Realizar pago"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
