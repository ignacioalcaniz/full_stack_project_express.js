import "./Ofertas.css"
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Loader } from '../../components/Loader/Loader';
import { Link } from "react-router-dom";


export const Ofertas = () => {

    useEffect(() => {
        document.title = "Ofertas - THE LIBRARY";
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = '../img/oferta.ico';
        document.head.appendChild(link);
      }, []);

    const [libro, setLibros] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            const librosCollection = collection(db, "libros");
            const q = query(librosCollection, where("precio", "<", 15000));
            const librosSnapshot = await getDocs(q);
            const librosData = librosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setLibros(librosData);

        };

        fetchData();
    }, []);

    return (
        <>
            <main className="m-5">
                <h4 className="text-6xl text-center h4-titulos m-2 rounded">OFERTAS:</h4>
                <div className="row">
                    {libro.length > 0 ? (
                        libro.map((libro) => (
                            <div key={libro.id} className="card">
                                <h5 className="text-center">{libro.name}</h5>
                                <h5 className="text-center">Autor:{libro.autor}</h5>
                                <img className="img-lista" src={libro.img} alt={libro.name} />
                                <h6 className="text-center">Precio: ${libro.precio}</h6>
                                <button className="boton-info">
                                    <Link to={`${libro.id}`}>DETALLES:</Link>
                                </button>
                            </div>
                        ))
                    ) : (
                        <Loader />
                    )}
                </div>
            </main>
        </>



    )

}