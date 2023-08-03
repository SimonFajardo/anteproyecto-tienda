import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CategoryProductStyles.css";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";

const CategoryProduct = () => {
  const [cart, setCart] = useCart();
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.slug) {
      setLoading(true);
      getProductsByCat();
    }
  }, [params?.slug]);

  // Obtener productos por categoría
  const getProductsByCat = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/product-category/${params.slug}`
      );
      setProducts(data?.products);
      setCategory(data?.category);
      setTotal(data?.total);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Error al obtener los productos");
    }
  };

  return (
    <Layout>
      <div className="container mt-6 category titlePageCategory">
        {loading ? (
          <div className="text-center mt-4">
            <h4>Cargando productos...</h4>
          </div>
        ) : (
          <>
            <h4 className="text-center text-success mt-4   ">
              Categoría - {category?.name}
            </h4>
            <h6 className="text-center text-success ">
              {products?.length} {products?.length === 1 ? "resultado" : "resultados"} de búsqueda
            </h6>
          </>
        )}

        <div className="row">
          <div className="col-md-12 offset-1">
            <div className="d-flex flex-wrap">
              {products?.map((p) => (
                <div className="card m-2" key={p._id}>
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p.name}
                  />
                  <div className="card-body">
                    <div className="card-name-price">
                      <h5 className="card-title">{p.name}</h5>
                    </div>
                    <p className="card-text ">{p.description.substring(0, 60)}</p>
                    <p className="card-text">
                      <strong>Tallas:</strong> {p.variations.map((e) => e.size).join(" | ")}
                    </p>
                    <div className="card-name-price">
                      <button
                        className="btn btn-info text-white verDetalles ms-1"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="m-2 p-3">
              {products && products.length < total && (
                <button
                  className="btn btn-warning"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(page + 1);
                  }}
                >
                  Ver más
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProduct;
