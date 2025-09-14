import { useState } from "react"
import "./Counter.css"


export const Counter = ({ onAdd, q = 1, max }) => {

    const [count, setCount] = useState(q)

    const increment = () => {
        if (count < max) {
            setCount(count + 1);
        }

    }

    const decrement = () => {
        if (count > 1) {
            setCount(count - 1);
        }
    }
    const handleCantidad = (e) => {
        const value = Number(e.target.value);

        if (value >= 1 && value <= max) {
            setCount(value);
        } else if (value > max) {
            setCount(max);
        } else {
            setCount(1);
        }
    }


    return (
        <>
            <div className="row m-2 p-2 g-2">
                <div className=" div-count">
                    <button className="boton-count-1" onClick={decrement}>-</button>
                    <input
                        className="text-center"
                        type="number"
                        value={count}
                        max={max}
                        min="1"
                        onChange={handleCantidad}
                    />
                    <button className="boton-count-2" onClick={increment}>+</button>
                </div>
                <div className="div-add" >
                    <button className="boton-counter" onClick={() => { onAdd(count) }}>AGREGAR AL CARRITO</button>
                </div>

            </div>

        </>
    )



}