import { Title } from "../../components/Title/Title"
import { Footer } from "../../components/footer/Footer"
import { Outlet } from "react-router-dom"
import { Nav } from "../../components/NavBar/Nav"

export const Layout=()=>{


    return(
        <>
      
        <Title/>
        <Nav/>
       
        
        <Outlet/>
        <Footer/>
        
        </>
    )
}