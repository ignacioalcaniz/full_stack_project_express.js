import "./Categorias.css";
import { Link } from "react-router-dom";
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { Loader } from "../../components/Loader/Loader";
import { useState, useEffect } from "react";


export const Categorias = () => {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        document.title = "Otros Libros - THE LIBRARY";
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = '../img/libros.ico';
        document.head.appendChild(link);
      }, []);

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            const librosCollection = collection(db, "libros");
            const librosSnapshot = await getDocs(librosCollection);
            const librosData = librosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          
            setLibros( librosData);
            setLoading(false); 
        };

        fetchData();
    }, []);

    return (
        <main className="m-5" >
            <h4 className="text-6xl text-center h4-titulos m-2 rounded">OTROS LIBROS:</h4>
            {loading ? (
                <Loader />
            ) : (
                <div className="contenedorLibros gap-5">
                    {libros.map((libro) => (
    <div key={libro.id} className="carta">
    <h3 className='text-center'>{libro.name}</h3>
    <h4 className='text-center'>Autor:{libro.autor}</h4>
    <img className='img-carta' src={libro.img} alt="cover-img" />
    <p className="text-center">${libro.precio}</p>
    <button className="boton-info">
        <Link to={`/TheLibrary/OtroLibros/${libro.id}`}>DETALLES:</Link>
    </button>
</div>
                    ))}
                </div>
            )}
        </main>
    );
};
