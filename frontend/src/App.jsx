import { Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./pages/Layout/Layout";
import { Inicio } from "./pages/Inicio/Inicio";
import TodosLosLibros from "./pages/TodosLosLibros/TodosLosLibros";
import { DetalleLibro } from "./pages/TodosLosLibros/DetalleLibro";
import { Carrito } from "./pages/Carrito/Carrito";
import { Error as ErrorPage } from "./pages/Error/Error";
import { ResultadoBusqueda } from "./pages/Busqueda/ResultadoBusqueda";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tienda" />} />

      <Route path="/tienda" element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="libros" element={<TodosLosLibros />} />
        <Route path="libros/:id" element={<DetalleLibro />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="busqueda/:termino" element={<ResultadoBusqueda />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;





