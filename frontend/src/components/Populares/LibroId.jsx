import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection,getDocs,getFirestore } from 'firebase/firestore';
import "./LibroId.css"
import { Loader } from '../Loader/Loader';
import { LibroIdDetail } from './LibroIdDetail';
import { DatosContext } from "../../context/DatosContext"
import { useContext } from "react"


export const LibroId = () => {
  const { popularId } = useParams();
  const [libro, setLibros] = useState([]);
  const { comprar } = useContext(DatosContext);
  const onAdd=(q)=>{
   if(libro && libro.stock >= q){
    comprar(libro,q)
   }
  }

  useEffect(() => {
   
      const db=getFirestore();
      const items=collection(db,"products")
      getDocs(items)
      .then((snapshot)=>{
        const foundLibro = snapshot.docs.find(libro => libro.id === popularId);
        setLibros(foundLibro ? { id: foundLibro.id, ...foundLibro.data() } : null);
      })
      
   

   
  }, [popularId]);

  useEffect(() => {
    document.title = "Inicio - THE LIBRARY";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '../img/manual.ico';
    document.head.appendChild(link);
  }, []);

  return (
    <main>
            <div className='div-carta'>
      {libro ? (
       <LibroIdDetail max={libro.stock} onAdd={onAdd} name={libro.name} autor={libro.autor} img={libro.img} descripcion={libro.descripcion} precio={libro.precio} stock={libro.stock} categoria={libro.categoria}/>
      ) : (
        <Loader/>
      )}
    </div>
    </main>

  );
};
