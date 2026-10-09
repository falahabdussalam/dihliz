"use client";

import Link from "next/link";
import Hamburger from 'hamburger-react'
import { useEffect, useState } from "react";
import { BsArrowRight } from "react-icons/bs"

const navLinks = [
    {title:"Home",link:'/'},
    {title:"About",link:'/about'},
    {title:"Academics",link:'/academics'},
    {title:"Admission",link:'/admission'},
    // {title:"Campus Life",link:'/campus'},
    {title:"Gallery",link:'/gallery'},
    {title:"Contact",link:'/contact'},
];

const NavBar = ({active}:{active:String})=>{
    const [isOpen, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(()=>{
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    },[])

    return (
<section id='nav' className="no-print">
<nav className={`fixed top-0 z-40 w-full h-20 px-6 lg:px-32 flex justify-between items-center bg-white/90 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-md shadow-black/5" : "border-b border-gray-100"}`}>
    <Link href="/" aria-label="Dihliz World School home">
        <img src="/img/top.png" className="h-12 lg:h-14" alt="Dihliz World School" />
    </Link>

    <div className="lg:flex hidden items-center gap-1">
        {navLinks.map((link)=>{
            const isActive = active==link.title;
            return (
                <Link key={link.title} href={link.link}
                    className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 ${isActive ? "text-dihliz-500" : "text-gray-700 hover:text-dihliz-500"}`}
                >
                    {link.title}
                    <span className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-dihliz-500 transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0"}`}></span>
                </Link>
            );
        })}
        <Link href="/admission" className="btn btn-primary btn-sm text-white rounded-full px-5 ml-4 gap-2 normal-case">
            Apply Now <BsArrowRight/>
        </Link>
    </div>
</nav>

{isOpen && (
    <div
        className="fixed lg:hidden inset-0 z-30 bg-black/60 backdrop-blur-sm"
        onClick={()=>setOpen(false)}
    ></div>
)}

<div className={`fixed lg:hidden top-0 right-0 bottom-0 z-40 w-9/12 max-w-sm bg-white shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
    <div className="h-20 px-6 flex items-center border-b border-gray-100">
        <img src="/icon.png" className="h-10" alt="" />
    </div>
    <div className="py-4">
        {navLinks.map((link)=>{
            const isActive = active==link.title;
            return (
                <Link key={link.title} href={link.link} onClick={()=>setOpen(false)}
                    className={`mx-3 px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-colors duration-200 ${isActive ? "bg-lime-50 text-dihliz-500" : "text-gray-700 hover:bg-gray-50"}`}
                >
                    {link.title}
                    <BsArrowRight className="text-gray-400"/>
                </Link>
            );
        })}
    </div>
    <div className="px-6">
        <Link href="/admission" onClick={()=>setOpen(false)} className="btn btn-primary text-white rounded-full w-full gap-2">
            Apply Now <BsArrowRight/>
        </Link>
    </div>
</div>

<div className="fixed right-4 top-4 lg:hidden" style={{ zIndex:100 }}>
    <Hamburger toggled={isOpen} toggle={setOpen} size={24} color="#1f2937"></Hamburger>
</div>
<div className="h-20"></div>
</section>
    );
}
export default NavBar
