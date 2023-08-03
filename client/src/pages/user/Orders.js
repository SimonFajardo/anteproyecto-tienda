import React, { useState, useEffect } from "react";
import UserMenu from "../../components/Layout/UserMenu";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select, Modal } from "antd";
const { Option } = Select;

const Orders = () => {

  // Estilos personalizados para el modal
  const customModalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "50%", // Ajusta el ancho del modal según tus necesidades
      maxHeight: "80vh", // Ajusta la altura máxima del modal según tus necesidades
      overflow: "auto", // Habilita el desplazamiento si el contenido del modal es más largo
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Ajusta el color de fondo del overlay
      zIndex: 9999, // Ajusta el índice de apilamiento del overlay para que esté por encima de los elementos detrás del modal
    },
  };

  const [orders, setOrders] = useState([]);
  const [auth, setAuth] = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Obtener las órdenes del usuario autenticado
  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  // Manejar la acción de ver productos de una orden
  const handleViewProducts = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  return (
    <Layout title={"Historial de órdenes"}>
      <div className="container-fluid p-3 m-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">Historial de órdenes</h1>
            {orders?.map((o, i) => (
              <div key={o?._id} className="border shadow mb-4">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Estado de pago</th>
                        <th scope="col">Monto total</th>
                        <th scope="col">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td>{o?.status}</td>
                        <td>{moment(o?.createdAt).format("YYYY-MM-DD")}</td>
                        <td>{o?.payment.success ? "Pagada" : "Sin pagar"}</td>
                        <td>{o?.payment?.transaction?.amount}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewProducts(o)}
                          >
                            Ver productos
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para mostrar los productos de una orden */}
      <Modal
        visible={modalOpen}
        onCancel={closeModal}
        footer={null}
        style={customModalStyles}
      >
        {selectedOrder && (
          <div>
            <h4 className="text-center">Productos de la orden</h4>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Talla</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.size}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-success" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Orders;
