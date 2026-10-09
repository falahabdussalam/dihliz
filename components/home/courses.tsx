"use client";

import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import SectionTitle from "./section_title";

const items = [
    { title: "High School", tag: "CBSE", description: "With life skills training and competitive exam coaching", img: "highschool.jpg" },
    { title: "HSS Science", tag: "Plus One & Two", description: "With medical and engineering coaching from domain experts", img: "hssscience.jpg" },
    { title: "HSS Commerce", tag: "Plus One & Two", description: "With CA, CS and CMA foundation from professionals", img: "hsscommerce.jpg" },
    { title: "Islamic Science", tag: "Integrated", description: "Textual and practical wisdom of Islam with a focus on Arabic", img: "islamicscience.jpg" },
];

const Courses = () => {
    return (
        <div className="bg-white px-6 lg:px-32 py-24">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                <SectionTitle
                    align="left"
                    title={<>Programs offered at <span className="text-dihliz-500">Dihliz</span></>}
                    subtitle="Curricula designed around future and career possibilities, each paired with integrated Islamic studies."
                />
                <Link
                    href="/academics"
                    className="mb-12 inline-flex items-center gap-2 font-bold text-dihliz-500 hover:gap-3 transition-all"
                >
                    View all academics <BsArrowRight />
                </Link>
            </div>

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                    <Link
                        href="/academics"
                        key={item.title}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className="group relative block h-96 overflow-hidden rounded-2xl shadow-lg"
                    >
                        <img
                            src={`/img/academics/${item.img}`}
                            alt={item.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/40 to-transparent"></div>
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                            <span className="inline-block rounded-full bg-lime-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                                {item.tag}
                            </span>
                            <h3 className="mt-3 text-2xl font-extrabold">{item.title}</h3>
                            <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.description}</p>
                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-lime-500 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                Learn more <BsArrowRight />
                            </span>
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
};

export default Courses;
