import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Modal } from 'antd';
import AdminMenu from '../../components/Layout/AdminMenu';
import Layout from './../../components/Layout/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;

const AdminOrders = () => {
  const [status, setStatus] = useState([
    'No procesada',
    'Procesada',
    'Enviada',
    'Recibida',
    'Cancelada',
  ]);
  const [changeStatus, setChangeStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Obtener las órdenes del servidor
  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/v1/auth/all-orders'); // Realizar una solicitud GET para obtener las órdenes desde la ruta "/api/v1/auth/all-orders"
      setOrders(data); // Establecer las órdenes obtenidas en el estado "orders"
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Ocurrió un error al obtener las órdenes');
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders(); // Llamar a la función para obtener las órdenes al cargar el componente
  }, []);

  // Manejar el cambio de estado de una orden
  const handleChange = async (orderId, value) => {
    try {
      setLoading(true);
      await axios.put(`/api/v1/auth/order-status/${orderId}`, {
        status: value,
      }); // Realizar una solicitud PUT para actualizar el estado de la orden utilizando la ruta "/api/v1/auth/order-status/:orderId"
      getOrders(); // Volver a obtener las órdenes actualizadas después de cambiar el estado
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Mostrar los detalles de una orden en un modal
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: '#',
      dataIndex: '_id',
      key: '_id',
      render: (_, record, index) => index + 1, // Renderizar un número secuencial para la columna "#"
    },
    {
      title: 'Cliente',
      dataIndex: 'buyer',
      key: 'buyer',
      render: (buyer) => <span>{buyer?.name}</span>, // Renderizar el nombre del cliente
    },
    {
      title: 'Email',
      dataIndex: 'buyer',
      key: 'email',
      render: (buyer) => <span>{buyer?.email}</span>, // Renderizar el email del cliente
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <span>{moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}</span> // Formatear y renderizar la fecha de creación de la orden
      ),
    },
    {
      title: 'Estado de pago',
      dataIndex: 'payment',
      key: 'success',
      render: (payment) => (
        <span>{payment?.success ? 'Pagada' : 'Sin pagar'}</span> // Renderizar el estado de pago de la orden
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'payment',
      key: 'amount',
      render: (payment) => (
        <span>{payment?.transaction?.amount}</span> // Renderizar el monto de la transacción de pago
      ),
    },
    {
      title: 'Productos',
      key: 'products',
      render: (text, record) => (
        <Button className='status-select' onClick={() => handleViewOrder(record)}>
          Ver productos
        </Button>
      ), // Renderizar un botón para ver los productos de la orden
    },
    {
      title: 'Cambiar Estado',
      key: 'changeStatus',
      render: (text, record) => (
        <Select
          defaultValue={record.status}
          style={{ width: 120 }}
          className='status-select'
          onChange={(value) => handleChange(record._id, value)}
        >
          {status.map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Select>
      ), // Renderizar un select para cambiar el estado de la orden
    },
  ];

  return (
    <Layout>
      <div className="row container-fluid m-3 p-3 dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1>Todas las órdenes</h1>
          <Table
            columns={columns}
            rowKey={(record) => record._id}
            dataSource={orders}
            pagination={false}
            loading={loading}
          />
        </div>
      </div>
      <Modal
        visible={modalVisible}
        onCancel={closeModal}
        title="Detalles de la orden"
        footer={[
          <Button key="cerrar" onClick={closeModal}>
            Cerrar
          </Button>
        ]}
      >
        {selectedOrder && (
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
        )}
      </Modal>
    </Layout>
  );
};

export default AdminOrders;
