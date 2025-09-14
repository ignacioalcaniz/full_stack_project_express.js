import { Link } from "react-router-dom"
import { LibroShow } from "./LibroShow"
import "./LibrosList.css"




export const LibrosList = ({ LibrosLocales }) => {
  

    const renderedBooks = LibrosLocales.map((libro) => {
        return <LibroShow key={libro.id} titulo={libro} autor={libro} imagen={libro} precio={libro}  info={<Link to={`/TheLibrary/${libro.id}`}>DETALLES:</Link>} ></LibroShow>

    })


    return (
        <>
            <div className="contenedor">{renderedBooks}</div>
        </>
    )
}