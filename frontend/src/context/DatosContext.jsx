import { createContext, useState,useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const DatosContext = createContext();



export const CompPadre = ({ children }) => {
   
    const [carrito, setCarrito] = useState([])
    const [showinput, setShowInput] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const[finalPrice,setFinalPrice]=useState(0)
    const navigate = useNavigate();
    const finish=useNavigate()
    const[showform,setShowform]=useState(true)
    const[buyer,setBuyer]=useState({
        nombre:"",
        apellido:"",
        telefono:"",
        direccion:"",
        email:""
    })

    const[error,setError]=useState({
        nombre:"",
        apellido:"",
        telefono:"",
        direccion:"",
        email:""
    })
  
  





    const comprar = ({ id, name, img, descripcion, precio,stock }, q) => {
        if (q > 0) {
            setCarrito((prevCarrito) => {
                const existingItemIndex = prevCarrito.findIndex(item => item.id === id);
                if (existingItemIndex >= 0) {
                    const updatedCart = [...prevCarrito];
                    updatedCart[existingItemIndex].cantidad += q;

                    return updatedCart;
                } else {

                    return [
                        ...prevCarrito,
                        { id, name, img, descripcion, precio,stock, cantidad: q },
                    ];
                }
            });
        }
       
    };
   

    const eliminar = (id) => {
        Swal.fire({
            title: "Seguro que quieres eliminar este producto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Si, eliminar",
            background:"blue",
            color:"white"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Eliminado",
                text: "Tu producto fue eliminado",
                icon: "success",
                background:"blue",
                color:"white",
              });
              setCarrito((prevCarrito) => {
                const nuevoCarrito = prevCarrito.filter(item => item.id !== id);
                return nuevoCarrito;
    
            });
            }
          });
    };



    const editar = (id) => {
        setEditingProductId(id)
        setShowInput(true)
    }


    const handleInputChange = (event, id) => {
        const newQuantity = Number(event.target.value);
        setCarrito((prevCarrito) => {
            return prevCarrito.map(item =>
                item.id === id ? { ...item, cantidad: newQuantity } : item
            );
        });
       
    };

    const total = useCallback(() => {
        const finalPrice = carrito.reduce((acc, item) => {
            return acc + (item.precio * item.cantidad);
        }, 0);
        
        setFinalPrice(finalPrice);
        return finalPrice;
    }, [carrito]); 
    
    useEffect(() => {
        total(); 
    }, [total]); 

    
    const finalizarCompra = () => {
        navigate('/TheLibrary/Carrito/mediosDePago');
    }

    const clearCarrito=()=>{
        setCarrito([])
        finish("/TheLibrary")
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Su pedido ha sido completado con exito!",
            showConfirmButton: false,
            timer: 2000,
            background:"blue",
            color:"white",
          });

    }




    return (
        <DatosContext.Provider value={{ error,setError,buyer,setBuyer,showform,setShowform,clearCarrito,total,finalizarCompra,finalPrice, carrito, comprar, eliminar, editar, handleInputChange, setShowInput,showinput, editingProductId }}>
            {children}
        </DatosContext.Provider>
    )
}




