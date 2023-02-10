import { useRouter } from "next/router";
import Hamburger from 'hamburger-react'
import { useEffect, useState } from "react";
import {AiOutlineArrowRight} from "react-icons/ai"

const NavBar = ({active}:{active:String})=>{
    const [isOpen, setOpen] = useState(false)
    const [curOpen, setCurOpen] = useState<any>(null)
const navLinks = [
    {title:"Home",link:'/'},
    {title:"About",link:'/about'},
    {title:"Academics",link:'/academics'},
    {title:"Admission",link:'/admission'},
    // {title:"Campus Life",link:'/campus'},
    {title:"Gallery",link:'/gallery'},
    {title:"Contact",link:'/contact'},


];
    const router = useRouter();

useEffect(()=>{
    
},[])

    return (
       
<section id='nav'>
   

<nav className="px-10 lg:px-32 py-4 flex justify-between items-center fixed z-40 w-full bg-white shadow-sm">
<img src="/img/top.png" className="h-16" alt=""
onClick={()=>router.push('/')
}
/>

<div className="lg:flex hidden">
    {
        navLinks.map((link,index)=>{
return (<a key={index}  
    className={active==link.title?"menu-item font-bold text-dihliz-600 hover:text-dihliz-600":
    "menu-item hover:text-dihliz-600"} 

href={link.link}
onClick={(e)=>{
    e.preventDefault();
    router.push(link.link);
}}

>{link.title}</a>
);

        })
    }

</div>



</nav>

    {isOpen && (
            <div 
            className="fixed lg:hidden top-0 right-0 bottom-0 z-40  bg-white shadow-2xl  w-8/12 "
            data-aos="fade-left"
            >
                <div className="my-20 mx-6"></div>
                  {
        navLinks.map((link,index)=>{
return (<a key={index}  className="px-8 py-3 hover:bg-gray-200 font-bold flex items-center hover:pl-10 hover:text-dihliz-600 transition-all duration-300"
href={link.link}
onClick={(e)=>{
    e.preventDefault();
    router.push(link.link);
}}
>
{/* <AiOutlineArrowRight className="mr-3"/> */}

<img src="/img/icon.png"  className="w-4 mr-3" alt="" />
     {link.title}</a>
);

        })
    }
                </div>
       
    )}

<div className="fixed right-6 top-3  lg:hidden"
style={{
    zIndex:100
}}
>
<Hamburger toggled={isOpen} toggle={setOpen} ></Hamburger>

</div>
<div className="py-8"></div>
{
    isOpen && (
        <div
className="bg-black bg-opacity-70 fixed w-full h-full z-30"
onClick={()=>setOpen(false)}
></div>
    )
}
</section>

    );
}
export default NavBar