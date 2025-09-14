import "./../node_modules/bootstrap/dist/css/bootstrap.min.css"
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import { Inicio } from "./pages/Inicio/Inicio";
import { Categorias } from "./pages/TodosLosLibros/Categorias";
import { Carrito } from "./pages/Carrito/Carrito";
import { Error } from "./pages/Error/Error";
import { Layout } from "./pages/Layout/Layout";
import { ListaCategoria } from "./pages/TodosLosLibros/ListaCategoria";
import { CompPadre } from "./context/DatosContext";
import { LibroId } from "./components/Populares/LibroId";
import { Ofertas } from "./pages/ofertas/Ofertas";
import { OfertasId } from "./pages/ofertas/OfertasId";
import { MediosDePago } from "./pages/Carrito/MediosDePago";















function App() {





    return (

        <BrowserRouter >
            <CompPadre>
                <Routes>
                    <Route path="/TheLibrary" element={<Layout />}>
                        <Route index element={<Inicio />} />
                        <Route path="OtroLibros" element={<Categorias />} />
                        <Route path="Ofertas" element={<Ofertas/>}/>
                        <Route path="Carrito" element={<Carrito />} />
                        <Route path="OtroLibros/:id" element={<ListaCategoria />} />
                        <Route path="/TheLibrary/:popularId" element={<LibroId />} />
                        <Route path="Ofertas/:ofertasId" element={<OfertasId/>}/>
                        <Route path="Carrito/mediosDePago" element={<MediosDePago/>}/>
                        <Route path="*" element={<Error />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/TheLibrary" />} />
                </Routes>
            </CompPadre>

        </BrowserRouter>


    )






}

export default App;
