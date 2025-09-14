import "./BookShow.css";


export const BookShow = ({ id,precio,image, title, descripcion,autor,info }) => {



    return (
      <div key={id.id} className="card">
      <h3 className='text-center'>{title.name}</h3>
      <h4 className='text-center'>Autor:{autor.autor}</h4>
      <img className='img-buscar' src={image.img} alt="cover-img" />
      <p className="text-center">${precio.precio}</p>
      <p className="text-center bg-white">{descripcion.descripcion}</p>
      <button className="boton-info">
      {info}
      </button>
  </div>
    );
};