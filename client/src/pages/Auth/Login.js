import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/AuthStyles.css";
import login from "./img/login.png";
import { useAuth } from "../../context/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [shown, setShown] = useState(false);
  const [email, setEmail] = useState(" ");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();
  const [emailError, setEmailError] = useState("");
  const switchShown = () => setShown(!shown);
  const onChange = ({ currentTarget }) => setPassword(currentTarget.value);
  const navigate = useNavigate();
  const location = useLocation();

  // FUNCIÓN DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Ingrese un email válido");
      return;
    } else {
      setEmailError("");
    }

    try {
      const res = await axios.post("/api/v1/auth/login", {
        email,
        password,
      });
      if (res && res.data.success) {
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        navigate(location.state || "/");
      } else {
        setEmailError(res.data.message);
      }
    } catch (error) {
      console.log(error);
      setEmailError("Ocurrió un error");
    }
  };

  return (
    <Layout title="Login - Hella Store">
      <div className="content-wrapper m-0 contenido">
        <div className="content">
          <div className="row">
            <div className="col-lg-5 col-xs-5 col-sm-5">
              <div className="form-container" style={{ minHeight: "90vh" }}>
                <form onSubmit={handleSubmit}>
                  <h4 className="title">Iniciar sesión</h4>

                  <div className="mb-3">
                    <label
                      style={{ fontSize: "12px", marginBottom: "6px" }}
                    >
                      <strong>Email</strong>
                    </label>

                    <input
                      type="text"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      id="exampleInputEmail1"
                      placeholder="Ingresa tu email"
                      required
                    />
                    {emailError && (
                      <small className="text-danger">{emailError}</small>
                    )}
                  </div>
                  <div className="mb-0 row">
                    <label
                      style={{ fontSize: "12px", marginBottom: "6px" }}
                    >
                      <strong>Clave</strong>
                    </label>

                    <div className="col-9">
                      <input
                        onChange={onChange}
                        type={shown ? "text" : "password"}
                        value={password}
                        className="form-control"
                        id="exampleInputPassword1"
                        placeholder="Ingresa tu clave"
                        required
                      />
                    </div>
                    <div className="col-3">
                      <button
                        type="button"
                        style={{
                          backgroundColor: "white",
                          padding: "4px",
                          border: "none",
                          color: "#059669",
                          marginBottom: "4px",
                        }}
                        className=" mb-3 "
                        onClick={switchShown}
                      >
                        {shown ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary ingresar">
                    Ingresar
                  </button>
                </form>
              </div>
            </div>
            <div className="col-lg-5 col-xs-5 col-sm-5 imagen">
              <div className="container">
                <img
                  src={login}
                  className="mt-6 pt-6 pl-0"
                  width="510px"
                  height="460"
                  alt="Imagen de registro"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
