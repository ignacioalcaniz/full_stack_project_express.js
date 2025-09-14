import { useContext } from "react";
import { DatosContext } from "../../context/DatosContext";
import "./Carrito.css"
import { Formulario } from "./Formulario";
import { useEffect } from "react";



export const Carrito = () => {
  useEffect(() => {
    document.title = "Carrito- THE LIBRARY";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '../img/carrito.ico';
    document.head.appendChild(link);
  }, []);

  const { error, setError, buyer, setBuyer, showform, setShowform, finalizarCompra, finalPrice, carrito, eliminar, showinput, editar, handleInputChange, editingProductId, setShowInput } = useContext(DatosContext);


  const handleChange = (e) => {
    setBuyer({
      ...buyer,
      [e.target.name]: e.target.value.trim()
    })
  }


  const submit = (e) => {
    e.preventDefault();
    const localError = {};
    const fieldsToValidate = ['nombre', 'direccion', 'email',"telefono"];
    
  

    fieldsToValidate.forEach(field => {
      if (!buyer[field]) {
        setShowform(true);
        localError[field] = `El campo: ${field} es obligatorio`;
      }
    });
   

    if (Object.keys(localError).length === 0) {
      setShowform(false);

    } else {
      setError(localError);
    }
  };




  return (
    
    
      <main className="m-5">
        <h4 className="text-6xl text-center h4-titulos m-2 rounded">CARRITO:</h4>
 
       
          {carrito.length > 0 && showform &&(
           <div className="div-form">
            <Formulario title={"Complete el formulario de perfil:"} handleChange={handleChange} submit={submit} formData={buyer} error={error} />
          <div className="div-crear-perfil ">
            <button className="boton-crear-perfil" type="submit" onClick={submit}>ACEPTAR</button>
          </div>
        </div>)}

        <div className=" contenedor-carrito ">
          {carrito.length === 0 ? (
            <p className="p-empty">No hay productos en el carrito.</p>
          ) : (
            <ul >
              <p className="text-center parrafo-central">Productos agregados al carrito:</p>
              {carrito.map((item) => (
                <li className="producto row" key={item.id}>
                  <div className="col-6 div-boton m-2">
                    <img className="img-cart" src={item.img} alt={item.nombre} />
                  </div>
                  <div className="col-4 div-info">
                    <p>Nombre: {item.name} </p>
                    <p> Cantidad: {item.cantidad}</p>
                    <p>Precio por unidad:${item.precio}</p>
                    <p>Descripcion:{item.descripcion}</p>
                    <div className="div-eliminar">
                      <button className="m-2 boton-eliminar" onClick={() => eliminar(item.id)}>Eliminar Producto</button>
                      <div>
                        <button onClick={() => { editar(item.id) }} className="m-2 boton-editar">Editar Cantidad </button>
                        {showinput && editingProductId === item.id && (
                          <div>
                            <input
                              type="number"
                              value={item.cantidad}
                              min={1}
                              max={item.stock}
                              onChange={(e) => handleInputChange(e, item.id)}
                            />
                            <button className="boton-aceptar" onClick={() => {
                              if (item.cantidad === 0) {
                                eliminar(item.id);
                              }
                              setShowInput(false);
                            }}>ACEPTAR</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="d-flex justify-content-center">
          {
            carrito.length > 0 &&
            <div className="w-25 d-flex flex-column m-2 ">
              <p className=" p-total text-center"> TOTAL A PAGAR:${finalPrice}</p>
              {!showform && <button onClick={finalizarCompra} className="boton-orden w-25 m-auto  ">PAGAR</button>}
            </div>
            }
        </div>
      </main>

   
  )
}
