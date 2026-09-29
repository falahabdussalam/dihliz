"use client";

import { useRouter } from "next/navigation";

const Footer = () => {
    const links:Array<any>= [
        {title:"Home",link:'/'},
        {title:"About",link:'/about'},
        {title:"Academics",link:'/academics'},
        {title:"Admission",link:'/admission'},
        // {title:"Campus Life",link:'/campus'},
        {title:"Gallery",link:'/gallery'},
        {title:"Contact",link:'/contact'},

    ];
    const router = useRouter();
    return (
        <div className="bg-dihliz-600 text-center text-white py-10">
            <section className="flex flex-wrap justify-center">
                {
                    links.map((link, index) => (
                        <a href={link.link} 
                        onClick={(e)=>{
                            e.preventDefault();
                            router.push(link.link);
                        }}
                        className="px-4 footer-link text-lime-50 hover:text-white duration-500 hover:-mt-2"
                        key={index}>
                            {link.title}
                            </a>
                    ))
                }
            </section>
            <div className="pt-5 text-white">&copy; {new Date().getFullYear()} Dihliz World School </div>
        
        <div className="text-xs text-gray-200"><a href="https://ziqx.in">Powered By  Ziqx</a> </div>
        </div>
    );
}

export default Footer;