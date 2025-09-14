import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { BookList } from "../BuscarLibros.jsx/BookList"; 
import { getFirestore, collection,  getDocs } from "firebase/firestore";


export const NavBar = () => {
    const [books, setBooks] = useState([]);

    const fetchData = async (name) => {
        const db = getFirestore();
        const productosCollection = collection(db, "products");
        const librosCollection = collection(db, "libros");
        const productosSnapshot = await getDocs(productosCollection);
        const productosData = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const librosSnapshot = await getDocs(librosCollection);
        const librosData = librosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredProducts = productosData.filter(product => product.name === name);
        const filteredLibros = librosData.filter(libro => libro.name === name);
        const combinedData = [...filteredProducts, ...filteredLibros];
        setBooks(combinedData);
    };
    

    return (
        <div>
            <SearchBar submit={fetchData} />
            <BookList books={books} />
        </div>
    );
};











