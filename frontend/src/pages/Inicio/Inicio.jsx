import { LibrosPopulares } from "../../components/Populares/LibrosPopulares"
import { NavBar } from "../../components/NavBar/NavBar"
import { useEffect } from "react";



export const Inicio=()=>{
  useEffect(() => {
    document.title = "Inicio - THE LIBRARY";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '../img/manual.ico';
    document.head.appendChild(link);
  }, []);

    return(
        <>
          <NavBar/>
     
      <main className="m-5">
        
        <h2 className="text-6xl text-center h4-titulos m-2 rounded">Libros Populares:</h2>
        <LibrosPopulares/>
      
      
        
      
      </main>
        
      
      
        </>
    )
}