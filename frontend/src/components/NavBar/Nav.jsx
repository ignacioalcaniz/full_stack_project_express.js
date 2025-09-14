import "./Nav.css"
import { Link } from "react-router-dom"
import { CardWidget } from "./CardWidget"
import { DatosContext } from "../../context/DatosContext"
import { useContext } from "react"

export const Nav = () => {
const{carrito}=useContext(DatosContext)

    return (
        <>
            <nav className="Nav m-2 rounded border-4 border-black position-sticky top-0" >

                <ul className="	flex justify-between m-6 text-2xl p-auto align-items-center  ">
                    <li><Link to={"/TheLibrary"}>INICIO</Link></li>
                    <li><Link to={"/TheLibrary/OtroLibros"}>OTROS LIBROS</Link></li>
                    <li><Link to={"/TheLibrary/Ofertas"}>OFERTAS</Link></li>
                    <li><Link to={"/TheLibrary/Carrito"}><CardWidget /><p className="text-center">{carrito.length}</p></Link></li>
                </ul>
               
            </nav>
        </>
    )
}