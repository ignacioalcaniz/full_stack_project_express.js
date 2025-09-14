import { useContext, useState } from "react"
import "./Medios.css"
import { DatosContext } from "../../context/DatosContext"
import { Formulario } from "./Formulario"
import { collection, getFirestore, addDoc } from "firebase/firestore/lite"
import { useEffect } from "react"




export const MediosDePago = () => {


    useEffect(() => {
        document.title = "Medios de Pago- THE LIBRARY";
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = '/img/tarjeta.ico';
        document.head.appendChild(link);
      }, []);
    
    const { total, carrito, buyer, clearCarrito } = useContext(DatosContext)
    const [showdiv, setShowdiv] = useState(false)
    const [showdiv2, setShowdiv2] = useState(false)
    const [cuotas, setCuotas] = useState(0)
    const [showcuotas, setShowcuotas] = useState(false)
    const [selectedCard, setSelectedCard] = useState("");
    const [btn, setBton] = useState(false)
  





    const [card, setCard] = useState({
        TITULAR: "",
        NUMERO: "",
        CODIGO: "",
        VENCIMIENTO: ""

    })
    const [error, setError] = useState({
        TITULAR: "",
        NUMERO: "",
        CODIGO: "",
        VENCIMIENTO: ""
    })

    const handleChange = (e) => {
        setCard({
            ...card,
            [e.target.name]: e.target.value
        })
    }

    const submit = (e) => {
        e.preventDefault();
        const localError = {};
        const fieldsToValidate = ['TITULAR', 'NUMERO', 'CODIGO', 'VENCIMIENTO'];

        fieldsToValidate.forEach(field => {
            if (!card[field]) {
                localError[field] = `el campo: ${field} es obligatorio`;
            }
        });
        if (Object.keys(localError).length === 0) {


            if (selectedCard === "credito") {
                setShowcuotas(true);
                setShowdiv(false);
            } else if (selectedCard === "debito") {
                setShowdiv2(false);
                setShowcuotas(false);
                setBton(true)

            }
        } else {
            setError(localError);
        }
    };



    const addToCart = (e) => {
        const db = getFirestore()
        const orderCollection = collection(db, "orders")
        submit(e);

        const purchase = {
            Productos: carrito,
            InfoComprador: { buyer, card },
            Total: total(),
            Cuotas: cuotas,
            Date: new Date()
        }
        addDoc(orderCollection, purchase)
        clearCarrito()



    }
    return (
        <>
            <main >
                <h4 className=" m-5 text-6xl text-center h4-titulos m-2 rounded">Finalizar compra:</h4>


                <div className="d-flex flex-row row m-auto">
                    <div className="col-6 div-credito mb-3  ">
                        <button onClick={() => { setShowdiv(true); 
                            setShowdiv2(false); 
                            setSelectedCard("credito");
                            setBton(false);
                        setCard({  TITULAR: "",
                            NUMERO: "",
                            CODIGO: "",
                            VENCIMIENTO: ""})}}
                            className="boton-credito" >PAGA CON TARJETA DE CREDITO:</button>
                        {showdiv && (
                            <div className="div-form-pago  ">
                                <Formulario title={"Complete informacion de su tarjeta:"} formData={card} handleChange={handleChange} submit={submit} error={error} />
                                <div className="div-crear-perfil ">
                                    <button className="boton-crear-perfil" onClick={submit} type="submit" >ACEPTAR</button>
                                </div>
                            </div>
                        )}
                        {showcuotas && !btn && (
                            <div className="div-cuotas d-flex flex-column align-items-center gap-4">
                                <h3 className="h3-cuotas">Elija Cantidad de cuotas:</h3>
                                <button onClick={() => { setCuotas(3); }} className={`cuota-boton ${cuotas === 3 ? 'boton-rojo' : ''}`} >
                                    3 cuotas sin interés de: ${total() / 3}
                                </button>
                                <button onClick={() => { setCuotas(6) }} className={`cuota-boton ${cuotas === 6 ? 'boton-rojo' : ''}`}>
                                    6 cuotas sin interés de: ${total() / 6}
                                </button>
                                <button onClick={() => { setCuotas(12); }} className={`cuota-boton ${cuotas === 12 ? 'boton-rojo' : ''}`}>
                                    12 cuotas sin interés de: ${total() / 12}
                                </button>
                                <button type="submit" onClick={addToCart} className="boton-finalizar">Finalizar Compra</button>
                            </div>
                        )}
                    </div>




                    <div className="col-6 div-debito mb-3">
                        <button onClick={() => {
                            setShowdiv2(true);
                            setShowdiv(false);
                            setShowcuotas(false)
                            setSelectedCard("debito");
                            setCard({  TITULAR: "",
                                NUMERO: "",
                                CODIGO: "",
                                VENCIMIENTO: ""})
                            
                          
                        }} className="boton-debito" >PAGA CON TARJETA DE DEBITO:</button>
                        {showdiv2 && (


                            <div className="div-form-pago  ">
                                
                                <Formulario title={"Complete informacion de su tarjeta:"} formData={card} handleChange={handleChange} submit={submit} error={error} />
                                <div className="div-crear-perfil ">
                                    <button className="boton-crear-perfil" onClick={submit} type="submit"  >ACEPTAR</button>
                                </div>
                               
                            </div>
                        )}
                         {btn &&  (
                            <div className=" div-cuotas d-flex flex-column align-items-center gap-4 ">
                                <h5 className="h3-cuotas">Su tarjeta fue cargada con exito!</h5>
                                <button type="submit" onClick={addToCart} className="boton-finalizar">Finalizar Compra</button>
                            </div>
                        )}
                         




                    </div>
                </div>

            </main>

        </>
    )
}