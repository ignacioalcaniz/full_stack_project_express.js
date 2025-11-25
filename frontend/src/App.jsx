import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import Inicio from "./pages/Inicio/Inicio";
import TodosLosLibros from "./pages/TodosLosLibros/TodosLosLibros";
import LibroDetalle from "./pages/TodosLosLibros/LibroDetalle";
import Carrito from "./pages/Carrito/Carrito";
import Error from "./pages/Error/Error";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tienda" />} />

        <Route path="/tienda" element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="libros" element={<TodosLosLibros />} />
          <Route path="libros/:id" element={<LibroDetalle />} />
          <Route path="carrito" element={<Carrito />} />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

