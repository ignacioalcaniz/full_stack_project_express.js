import { Link } from "react-router-dom"
import "./Error.css"


export const Error=()=>{


    return(


        <>
        <div className="div-error">
        <h3 className="rounded-2">404 Not Found</h3>
        <p>Pagina no encontrada</p>
        <button className="boton-volver-error"><Link to={"/TheLibrary"}>Volver</Link></button>
        </div>
        
        </>
    )
}