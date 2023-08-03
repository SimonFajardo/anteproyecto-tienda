import React from "react";
import tarjeta from "./img/credit-card.png"
import calidad from "./img/calidad.png"
import camion from "./img/camion.png"
import ubicacion from "./img/ubicacion.png"
import "./style/footer.css"
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <div className="footer">
      <section >
        <h2 className="titulo-seccion">¿Por qué comprar con nosotros?</h2>
        <div className=" row d-flex justify-content-center  ">
            <div className="contenedor__4-columnas">
                <section className="column">
                    <img src={tarjeta}  alt="tarjeta-credito" width="250px" height="190px" />
                    <h3 className="subt-seccion">El mejor precio</h3>
                    <p className="parrafo">Consigue productos de marca, ropa nacional e importada a un precio accesible y económico ajustado a tu presupuesto</p>
                </section>
                <section className="column">
                    <img src={calidad} alt="calidad" width="250px" height="190px"/>
                    <h3 className="subt-seccion">La mejor calidad</h3>
                    <p className="parrafo">Nuestros productos son reconocidos principalmente por su calidad y estética</p>
                </section>
                <section className="column">
                    <img src={camion} alt="camion" width="250px" height="190px"/>
                    <h3 className="subt-seccion">Envío</h3>
                    <p className="parrafo">Entregamos nuestros productos en Achaguas a la puerta de tu casa para que compres con mayor comodidad</p>
                </section>
                <section className="column">
                    <img src={ubicacion} alt="ubicacion" width="250px" height="190px"/>
                    <h3 className="subt-seccion">Ubicanos</h3>
                    <p className="parrafo">Somos una tienda ubicada en Achaguas, estado Apure, Venezuela. Siguenos en <a className="link" href="https://www.instagram.com/_hellastore/">instagram</a></p>
                </section>
               
            </div>
        </div>
    </section>
    </div>
  );
};

export default Footer;
