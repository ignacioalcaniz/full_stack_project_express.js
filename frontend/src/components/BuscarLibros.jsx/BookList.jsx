import { BookShow } from "./BookShow";
import "./BookList.css";
import { Link } from "react-router-dom";

export const BookList = ({ books }) => {
    const renderedBooks = books.map((book) => {
        const isLibro = book.collectionType === 'libros';
        return (
            <BookShow 
                key={book.id} 
                title={book} 
                autor={book}
                precio={book}
                id={book}
                image={book} 
                descripcion={book} 
                info={
                    isLibro 
                        ? <Link to={`/TheLibrary/OtroLibros/${book.id}`}>DETALLES:</Link> 
                        : <Link to={`/TheLibrary/${book.id}`}>DETALLES:</Link>
                }
            />
        );
    });

    return (
        <div className="book-carta">
            {renderedBooks}
        </div>
    );
};


