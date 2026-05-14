import { useEffect } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { useProductsLive } from "../../hooks/useProductsLive";

export const Destacados = () => {
  const refreshKey = useProductsLive();

  useEffect(() => {
    document.title = "Destacados - THE LIBRARY";
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-8">
      <h2 className="titulo-seccion">⭐ Libros destacados</h2>
      <ProductCard key={`featured-page-${refreshKey}`} mode="featured" limit={20} showDesc={true} />
    </section>
  );
};


