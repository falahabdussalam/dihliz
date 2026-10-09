"use client";

import { FaChalkboardTeacher, FaRegMap } from "react-icons/fa";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { MdAutoGraph, MdOutlineWorkOutline } from "react-icons/md";
import { BsPersonLinesFill } from "react-icons/bs";
import SectionTitle from "./section_title";

const items = [
    {
        title: "Job Oriented Skills",
        description:
            "Courses outlined with a futuristic vision to build a pool of highly skilled talent, acquainting students with the skills their future professions demand.",
        icon: MdOutlineWorkOutline,
    },
    {
        title: "Holistic Development",
        description:
            "Intellectual, mental, physical, emotional and social growth that strengthens every child to stand straight and face any hurdle ahead.",
        icon: RiLightbulbFlashLine,
    },
    {
        title: "Thematic Learning",
        description:
            "Connecting real-life situations with textual ideas through thematic strategies, so concepts are understood as a whole and remembered.",
        icon: MdAutoGraph,
    },
    {
        title: "Career Mapping",
        description:
            "Personalised assessments and career-mapping tools help each student articulate and plan the profession they aspire to.",
        icon: FaRegMap,
    },
    {
        title: "Expert Teachers",
        description:
            "Passionate, skilled and experienced teachers who influence and develop the values, potential and skills of every student.",
        icon: FaChalkboardTeacher,
    },
    {
        title: "Personalised Training",
        description:
            "Individual attention within a well-designed curriculum brings out hidden talents: mentally, physically and intellectually.",
        icon: BsPersonLinesFill,
    },
];

const Services = () => {
    return (
        <div className="bg-lime-50 px-6 lg:px-32 py-24">
            <SectionTitle
                title={<>An education designed for <span className="text-dihliz-500">the whole child</span></>}
                subtitle="Our approach blends academic rigour, character building and future-ready skills in a serene residential campus."
            />
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            data-aos="fade-up"
                            data-aos-delay={(index % 3) * 100}
                            className="group relative overflow-hidden rounded-2xl bg-white p-8 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dihliz-500/10"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-dihliz-500/10 text-dihliz-500 text-3xl transition-colors duration-300 group-hover:bg-dihliz-500 group-hover:text-white">
                                <Icon />
                            </div>
                            <h3 className="mt-6 text-xl font-extrabold text-gray-900">{item.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-500">{item.description}</p>
                            <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-dihliz-500 to-lime-500 transition-all duration-500 group-hover:w-full"></span>
                        </div>
                    );
                })}
            </section>
        </div>
    );
};

export default Services;
