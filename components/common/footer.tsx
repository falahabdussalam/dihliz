"use client";

import Link from "next/link";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

const links = [
    {title:"Home",link:'/'},
    {title:"About",link:'/about'},
    {title:"Academics",link:'/academics'},
    {title:"Admission",link:'/admission'},
    // {title:"Campus Life",link:'/campus'},
    {title:"Gallery",link:'/gallery'},
    {title:"Contact",link:'/contact'},
];

const programs = ["High School (CBSE)", "HSS Science", "HSS Commerce", "Islamic Science"];

const Footer = () => {
    return (
        <footer className="no-print bg-forest-900 text-white/70">
            <div className="px-6 lg:px-32 pt-16 pb-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <img src="/img/white.png" className="w-24" alt="Dihliz World School" />
                    <p className="mt-5 text-sm leading-relaxed">
                        A global gateway to cutting-edge schooling, under Markaz Garden, Calicut.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        {links.map((link) => (
                            <li key={link.title}>
                                <Link href={link.link} className="hover:text-lime-500 transition-colors duration-200">
                                    {link.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Programs</h4>
                    <ul className="space-y-2 text-sm">
                        {programs.map((program) => (
                            <li key={program}>
                                <Link href="/academics" className="hover:text-lime-500 transition-colors duration-200">
                                    {program}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">Get in Touch</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <HiOutlineLocationMarker className="mt-0.5 text-lg shrink-0 text-lime-500" />
                            Markaz Garden, Poonoor, Calicut, Kerala, India 673574
                        </li>
                        <li>
                            <a href="tel:04952963484" className="flex items-center gap-3 hover:text-lime-500">
                                <HiOutlinePhone className="text-lg shrink-0 text-lime-500" />
                                0495 2963484
                            </a>
                        </li>
                        <li>
                            <a href="mailto:info@dihlizworldschool.com" className="flex items-center gap-3 hover:text-lime-500 break-all">
                                <HiOutlineMail className="text-lg shrink-0 text-lime-500" />
                                info@dihlizworldschool.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 px-6 lg:px-32 py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs">
                <div>&copy; {new Date().getFullYear()} Dihliz World School. All rights reserved.</div>
                <a href="https://ziqx.in" className="hover:text-white">Powered by Ziqx</a>
            </div>
        </footer>
    );
}

export default Footer;
