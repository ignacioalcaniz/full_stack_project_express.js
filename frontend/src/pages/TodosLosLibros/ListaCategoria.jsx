import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import "./ListaCategoria.css";
import { DatosContext } from "../../context/DatosContext";
import { getDocs, collection, getFirestore } from "firebase/firestore";
import { Loader } from "../../components/Loader/Loader";
import { ListaCategoriaDetail } from "./ListaCategoriaDetail";


export const ListaCategoria = () => {


  useEffect(() => {
    document.title = "Otros Libros - THE LIBRARY";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '/img/libros.ico';
    document.head.appendChild(link);
  }, []); 


  const { id } = useParams();
  const [libro, setLibros] = useState([]);
  const { comprar } = useContext(DatosContext);
  const onAdd=(q)=>{
   if(libro && libro.stock >= q){
    comprar(libro,q)
   }
  }

  useEffect(() => {
    const db = getFirestore();
    const items = collection(db, "libros");
    getDocs(items)
    .then((snapshot) => {
      const foundLibro = snapshot.docs.find(libro => libro.id === id);
      setLibros(foundLibro ? { id: foundLibro.id, ...foundLibro.data() } : null);
    });
  }, [id]);

  return (
    <main>
      {libro ? (

        <div key={libro.id} >
        <ListaCategoriaDetail max={libro.stock} name={libro.name}autor={libro.autor} categoria={libro.categoria} img={libro.img} precio={libro.precio}descripcion={libro.descripcion} stock={libro.stock} onAdd={onAdd} />
  
        </div>
      ) : (
        <Loader />
      )}
      
    </main>
    
  );
};

