import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [photo, setPhoto] = useState("");
  const [sizes, setSizes] = useState(["S"]);
  const [prices, setPrices] = useState([]);
  const [formValid, setFormValid] = useState(false);
  const [priceError, setPriceError] = useState("");

  // Obtener todas las categorías
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Ha ocurrido un error al consultar las categorias");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Agregar una nueva talla
  const handleAddVariation = () => {
    setSizes([...sizes, ""]);
    setPrices([...prices, 0]);
    setQuantities([...quantities, 0]);
  };

  // Remover elementos de las variaciones
  const handleRemoveVariation = (index) => {
    const updatedSizes = [...sizes];
    const updatedPrices = [...prices];
    const updatedQuantities = [...quantities];
    updatedSizes.splice(index, 1);
    updatedPrices.splice(index, 1);
    updatedQuantities.splice(index, 1);
    setSizes(updatedSizes);
    setPrices(updatedPrices);
    setQuantities(updatedQuantities);
  };

  // Modificar la talla
  const handleSizeChange = (e, index) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = e.target.value;
    setSizes(updatedSizes);
  };

  // Modificar el precio
  const handlePriceChange = (e, index) => {
    const newPrice = Number(e.target.value);
    if (newPrice >= 0) {
      const updatedPrices = [...prices];
      updatedPrices[index] = newPrice;
      setPrices(updatedPrices);
      setPriceError("");
    } else {
      setPriceError("El precio no puede ser negativo");
    }
  };

  // Modificar la cantidad
  const handleQuantityChange = (e, index) => {
    const updatedQuantities = [...quantities];
    updatedQuantities[index] = Number(e.target.value);
    setQuantities(updatedQuantities);
  };

  // Validar el formulario
  useEffect(() => {
    const hasSizes = sizes.length > 0;
    const hasValidPrices = prices.every((price) => price > 0);
    const hasValidQuantities = quantities.every((quantity) => quantity >= 0);
    const isFormValid =
      hasSizes && hasValidPrices && hasValidQuantities && name !== "" && description !== "" && category !== "";
    setFormValid(isFormValid);
  }, [sizes, prices, quantities, name, description, category]);

  // Agregar una nueva palabra clave
  const handleAddKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  // Modificar una palabra clave
  const handleKeywordChange = (e, index) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = e.target.value;
    setKeywords(updatedKeywords);
  };

  // Remover una palabra clave
  const handleRemoveKeyword = (index) => {
    const updatedKeywords = [...keywords];
    updatedKeywords.splice(index, 1);
    setKeywords(updatedKeywords);
  };

  // Crear producto
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const variations = sizes.map((size, index) => ({
        size: size,
        price: prices[index],
        quantity: quantities[index],
      }));

      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("variations", JSON.stringify(variations));
      productData.append("photo", photo);
      productData.append("category", category);
      productData.append("keywords", JSON.stringify(keywords));

      const { data } = await axios.post("/api/v1/product/create-product", productData);

      if (data?.success) {
        toast.success(data?.message);
      } else {
        toast.danger("Verifique los campos para crear el producto");
        navigate("/dashboard/admin/create-product");
      }
    } catch (error) {
      console.log(error);
      toast.error("Complete los campos en el formulario");
    }
  };

  return (
    <Layout title={"Dashboard - Crear Producto"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Crear Producto</h1>
            <div className="m-1 w-75">
              <p>
                <strong>Categoría</strong>
              </p>
              <Select
                bordered={false}
                placeholder="Selecciona una categoria"
                size="large"
                showSearch
                className="form-select mb-3"
                onChange={(value) => {
                  setCategory(value);
                }}
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
              <div className="mb-3">
                <p>
                  <strong>Imagen</strong>
                </p>
                <label className="btn btn-outline-success col-md-12">
                  {photo ? photo.name : "Subir imagen"}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                    required
                  />
                </label>
              </div>
              <div className="mb-3">
                {photo && (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="product_photo"
                      height={"200px"}
                      className="img img-responsive"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <p>
                  <strong>Nombre del producto</strong>
                </p>
                <input
                  type="text"
                  value={name}
                  placeholder="Ingresa un nombre"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <p>
                  <strong>Marca</strong>
                </p>
                <input
                  type="text"
                  value={description}
                  placeholder="Ingresa una marca"
                  className="form-control"
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              {sizes.map((size, index) => (
                <div key={index} className="row mb-3 d-flex justify-content-left">
                  <div className="col-4 col-sm-3">
                    <p>
                      <strong>{`Talla ${size}`}</strong>
                    </p>
                    <input
                      type="text"
                      value={size}
                      placeholder="Ingresa la talla"
                      className="form-control"
                      onChange={(e) => handleSizeChange(e, index)}
                      required
                    />
                  </div>
                  <div className="col-4 col-sm-3">
                    <p>
                      <strong>Precio: {prices[index] !== undefined ? ` ${prices[index]}` : ""}</strong>
                    </p>
                    <input
                      type="number"
                      step="any"
                      value={prices[index]}
                      className="form-control"
                      min="0"
                      onChange={(e) => handlePriceChange(e, index)}
                      required
                    />
                    {priceError && <p className="text-danger">{priceError}</p>}
                  </div>
                  <div className="col-4 col-sm-3">
                    <p>
                      <strong>Cantidad {quantities[index] !== undefined ? ` ${quantities[index]}` : ""}</strong>
                    </p>
                    <input
                      type="number"
                      value={quantities[index]}
                      placeholder="Cantidad"
                      className="form-control"
                      onChange={(e) => handleQuantityChange(e, index)}
                      required
                    />
                  </div>
                  {sizes.length > 1 && (
                    <div className="col-4 col-sm-3 align-self-center">
                      <p>
                        <strong>Quitar</strong>
                      </p>
                      <button className="btn btn-danger" onClick={() => handleRemoveVariation(index)}>
                        X
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="mb-3">
                <button className="btn btn-success" onClick={handleAddVariation}>
                  Agregar Talla
                </button>
              </div>
              <div className="mb-3">
                <p>
                  <strong>Palabras clave</strong>
                </p>
                {keywords.map((keyword, index) => (
                  <div key={index} className="row mb-3">
                    <div className="col-10">
                      <input
                        type="text"
                        value={keyword}
                        placeholder="Ingresa una palabra clave"
                        className="form-control"
                        onChange={(e) => handleKeywordChange(e, index)}
                      />
                    </div>
                    {keywords.length > 1 && (
                      <div className="col-2 align-self-center">
                        <button className="btn btn-danger" onClick={() => handleRemoveKeyword(index)}>
                          X
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <button className="btn btn-success" onClick={handleAddKeyword}>
                    Agregar Palabra Clave
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-success" onClick={handleCreate} disabled={!formValid}>
                  Crear Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
