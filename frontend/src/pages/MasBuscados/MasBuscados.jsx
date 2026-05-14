import { useEffect } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { useProductsLive } from "../../hooks/useProductsLive";

export const MasBuscados = () => {
  const refreshKey = useProductsLive();

  useEffect(() => {
    document.title = "Más buscados - THE LIBRARY";
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-8">
      <h2 className="titulo-seccion">🔥 Los más buscados</h2>
      <ProductCard key={`popular-page-${refreshKey}`} mode="popular" limit={20} showDesc={true} />
    </section>
  );
};



