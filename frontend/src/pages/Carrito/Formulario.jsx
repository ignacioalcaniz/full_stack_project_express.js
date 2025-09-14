import "./Formulario.css"



export const Formulario = ({ submit, handleChange, formData,error,title }) => {





    return (
        <>
            <form className="gap-3" onSubmit={submit}>
                <h2 className="text-center">{title}</h2>

                {Object.keys(formData).map((key, i) => (
                    <div className=" div-form d-flex flex-column " key={i}>
                        
                        <label  htmlFor={key}  >Ingrese:{key}</label>
                        <input  type={key} name={key} id={key} onChange={handleChange} />
                        {
                       error[key]&& <span>{error[key]}</span>
                        }
                    </div>
                ))}
              
            </form>

        </>
    )
}