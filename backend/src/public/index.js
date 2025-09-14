const socketClient = io();
const div = document.getElementById("contenedor");
const form=document.getElementById("form")
const nombre = document.getElementById('nombre');
const imagen = document.getElementById('imagen');
const precio = document.getElementById('precio');
const personas = document.getElementById('personas');
const dias = document.getElementById('dias');
const destino = document.getElementById('destino');
const botonEnviar = document.getElementById('send');
const idEliminar=document.getElementById("id-eliminar")
const botonEliminar=document.getElementById("eliminar")


socketClient.on("allProducts", (productos) => {

    div.innerHTML = ""; 


    const productosHTML = productos.map((p) => {
        return `
            <div class="producto border border-dark gap-1 card w-25">
                <h2 class="text-center">${p.nombre}</h2>
                <img src="${p.imagen}" alt="productImage" class="img-fluid">
                <p class="text-center">Precio por persona:$${p.precio}</p>
                <p class="text-center">Días: ${p.dias}</p>
                <p class="text-center">Destino: ${p.destino}</p>
                <p class="text-center">Cantidad de personas: ${p.cantidad_personas}</p>
                <button class="border-black" id="boton-comprar" data-id="${p.id}">AGREGAR AL CARRITO</button>
              
            </div>
        `;
    }).join(''); 


    div.innerHTML = productosHTML;
})
;


botonEnviar.addEventListener("click",(event)=>{
    event.preventDefault()

    
    
    const product={
        nombre:nombre.value,
        thumbnails:imagen.value,
        precio:precio.value,
        dias:dias.value,
        cantidad_personas:personas.value,
        destino:destino.value
    }
 
    if(  product.nombre === "" || 
        product.thumbnails === "" || 
        product.precio === "" || 
        product.dias === "" || 
        product.cantidad_personas === "" || 
        product.destino === ""){
            
        alert("todos los campos son obligatorios")
            }else{
            socketClient.emit("newProduct",product)
            form.reset();
        }
  
})



socketClient.on("productos", (productos) => {

    div.innerHTML = ""; 


    const productosHTML = productos.map((p) => {
        return `
            <div class="producto border border-dark gap-1 card w-25">
                <h2 class="text-center">${p.nombre}</h2>
                <img src="${p.thumbnails}" alt="productImage" class="img-fluid">
                <p class="text-center">Precio por persona:$${p.precio}</p>
                <p class="text-center">Días: ${p.dias}</p>
                <p class="text-center">Destino: ${p.destino}</p>
                <p class="text-center">Cantidad de personas: ${p.cantidad_personas}</p>
                    <button class="border-black" id="boton-comprar" data-id="${p.id}">AGREGAR AL CARRITO</button>

            </div>
        `;
    }).join(''); 


    div.innerHTML = productosHTML;
})
;
botonEliminar.addEventListener("click",(event)=>{
    event.preventDefault();

   if(idEliminar.value===""){
    alert("ingrese id a eliminar")
   }else{
    socketClient.emit("deleteProduct",idEliminar.value)
   }

})

socketClient.on("updateProducts", (productos) => {

    div.innerHTML = ""; 


    const productosHTML = productos.map((p) => {
        return `
            <div class="producto border border-dark gap-1 card w-25">
                <h2 class="text-center">${p.nombre}</h2>
                <img src="${p.thumbnails}" alt="productImage" class="img-fluid">
                <p class="text-center">Precio por persona:$${p.precio}</p>
                <p class="text-center">Días: ${p.dias}</p>
                <p class="text-center">Destino: ${p.destino}</p>
                <p class="text-center">Cantidad de personas: ${p.cantidad_personas}</p>
                    <button class="border-black" id="boton-comprar" data-id="${p.id}">AGREGAR AL CARRITO</button>

            </div>
        `;
    }).join(''); 


    div.innerHTML = productosHTML;
})
;




