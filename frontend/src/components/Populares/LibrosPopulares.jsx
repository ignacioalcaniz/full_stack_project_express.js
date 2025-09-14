import { useEffect, useState } from 'react';
import { Loader } from '../Loader/Loader';
import { LibrosList } from "./LibrosList";
import { collection,getDocs,getFirestore } from 'firebase/firestore';


export const LibrosPopulares = () => {
  const [libros, setLibros] = useState([]);
  const[loader,setLoader]=useState(true)


  
  useEffect(()=>{
    const fetchData=async()=>{
      const db=getFirestore();
      const items=collection(db,"products")
      const productsSnapshot=await  getDocs(items)
      const productsData = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      


    
      setLibros(productsData);
      setLoader(false);
    
    }
    fetchData();
  
  },[])

  return (
    <div >
      {loader? <Loader />:<LibrosList LibrosLocales={libros} />}
    </div>
  );
};
