import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getFirestore,getDocs,collection } from "firebase/firestore"
import { Loader } from "../../components/Loader/Loader"
import { OfertasIdDetail } from "./OfertaIdDetail"
import { useContext } from "react"
import { DatosContext } from "../../context/DatosContext";



export const OfertasId=()=>{

  useEffect(() => {
    document.title = "Ofertas - THE LIBRARY";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '/img/oferta.ico';
    document.head.appendChild(link);
  }, []);

      const[libro,setLibros]=useState([])

      const { comprar } = useContext(DatosContext);
      const onAdd=(q)=>{
       if(libro && libro.stock >= q){
        comprar(libro,q)
       }
      }

    const {ofertasId}=useParams()
    useEffect(()=>{
        const db = getFirestore();
        const librosCollection = collection(db, "libros");
        getDocs(librosCollection)
        .then((snapshot) => {
          const foundLibro = snapshot.docs.find(libro => libro.id === ofertasId);
          setLibros(foundLibro ? { id: foundLibro.id, ...foundLibro.data() } : null);
        });

    },[ofertasId])

    return(
        libro?(<OfertasIdDetail key={libro.id} max={libro.stock} name={libro.name}autor={libro.autor} categoria={libro.categoria} img={libro.img} precio={libro.precio}descripcion={libro.descripcion} stock={libro.stock} onAdd={onAdd}/>)
        :
        (<Loader/>)
    )

}