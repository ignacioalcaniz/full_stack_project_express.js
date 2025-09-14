
import "./LibroShow.css"


export const LibroShow=({titulo,autor,imagen,info,precio})=>{


    return(
        <>
        <div className="carta ">
            <h3 className="text-center">{titulo.name}</h3>
            <h4 className="text-center">Autor:{autor.autor}</h4>
            <img className="img-show" src={imagen.img} alt="bookCover" />
            <p className="text-center"> ${precio.precio}</p>
            <button className="botonInfo">{info}</button>

        </div>
    
        
        </>
    )
}