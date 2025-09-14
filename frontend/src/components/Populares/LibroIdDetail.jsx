import { Counter } from "../CounterCarrito/Counter"

export const LibroIdDetail=({name,img,descripcion,precio,stock,categoria,autor,onAdd,max})=>{



    return(
        <>
          <main className="row">
        <div className="col-6 div-boton">
        <img  className="img-lista" src={img} alt={name} />
        <Counter onAdd={onAdd} max={max} />
        </div>
        <div className="col-5 div-info" >
        <h5 className="text-center">Titulo:{name}</h5>
          <h5 className="text-center">Autor:{autor}</h5>
          <h5 className="text-center">Categoria:{categoria}</h5>
          <p className="text-center">Descripción:</p>
          <p className="text-center bg-light">{descripcion}</p>
          <h6 className="text-center">Precio: ${precio}</h6>
          <p className="text-center">Cantidad disponible: {stock}</p>
        </div>
        
          
        </main>
        </>
    )
}