"use client";

import Link from "next/link";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { FaGlobeAsia, FaHome, FaPlay, FaQuran, FaTrophy } from "react-icons/fa";

const highlights = [
    { title: "Residential", description: "A home away from home", icon: FaHome },
    { title: "Islamic Studies", description: "In every stream", icon: FaQuran },
    { title: "Global Outlook", description: "Beyond borders", icon: FaGlobeAsia },
    { title: "All-round Excellence", description: "In and out of class", icon: FaTrophy },
];

const About = () => {
    const [playing, setPlaying] = useState(false);

    return (
        <div className="relative bg-white px-6 lg:px-32 pt-28 pb-24 overflow-hidden" id="about">
            <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-lime-50 blur-2xl"></div>

            <div className="relative grid lg:grid-cols-12 gap-14 lg:gap-16 items-center">
                <section className="lg:col-span-6 relative pb-16 pr-10 sm:pr-16" data-aos="fade-right">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-forest-900/20">
                        {playing ? (
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src="https://www.youtube.com/embed/oZSIO4-Ebas?autoplay=1&rel=0"
                                title="Glimpses of Dihliz World School"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setPlaying(true)}
                                className="group absolute inset-0 h-full w-full"
                                aria-label="Play video: Glimpses of Dihliz World School"
                            >
                                <img
                                    src="/img/bg.jpg"
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <span className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/10 to-transparent"></span>
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center">
                                    <span className="absolute inset-0 rounded-full bg-white/40 animate-ping"></span>
                                    <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-dihliz-500 shadow-xl transition-transform duration-300 group-hover:scale-110">
                                        <FaPlay className="ml-1 text-xl" />
                                    </span>
                                </span>
                                <span className="absolute bottom-5 left-6 text-left text-white">
                                    <span className="block text-lg font-extrabold">Glimpses of Dihliz</span>
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="absolute bottom-0 right-0 w-5/12 aspect-square overflow-hidden rounded-3xl border-[6px] border-white shadow-xl">
                        <img src="/img/header.jpg" alt="Students at Dihliz World School" className="h-full w-full object-cover" />
                    </div>

                    <div className="absolute -top-6 right-4 sm:right-10 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
                        <span className="text-4xl font-extrabold text-dihliz-500 leading-none">10+</span>
                        <span className="text-xs font-semibold leading-tight text-gray-500">
                            Years of<br />GSV legacy
                        </span>
                    </div>
                </section>

                <section className="lg:col-span-6" data-aos="fade-left">
                    <h2 className="text-3xl lg:text-[2.6rem] font-extrabold leading-tight text-gray-900">
                        The threshold to a <span className="text-dihliz-500">world of possibilities</span>
                    </h2>

                    <p className="mt-5 text-gray-500 leading-relaxed">
                        A residential school under Markaz Garden, Calicut, carrying forward GSV&apos;s decade-long legacy.
                    </p>

                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                        {highlights.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="group flex items-start gap-4 rounded-2xl p-4 ring-1 ring-gray-100 transition-all duration-300 hover:bg-lime-50 hover:ring-lime-500/30"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dihliz-500/10 text-dihliz-500 text-lg transition-colors duration-300 group-hover:bg-dihliz-500 group-hover:text-white">
                                        <Icon />
                                    </span>
                                    <span>
                                        <span className="block font-extrabold text-gray-900">{item.title}</span>
                                        <span className="block text-sm text-gray-500">{item.description}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-9 flex flex-wrap items-center gap-6">
                        <Link href="/about" className="btn btn-primary text-white rounded-full px-8 gap-2 normal-case text-base shadow-lg shadow-dihliz-500/20">
                            Know More <BsArrowRight />
                        </Link>
                        <a
                            href="https://www.youtube.com/watch?v=IN3Re5tJzFE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 font-bold text-gray-800 hover:text-dihliz-500"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-lime-500 text-lime-600 transition-colors duration-300 group-hover:bg-lime-500 group-hover:text-white">
                                <FaPlay className="text-xs ml-0.5" />
                            </span>
                            Watch Promo
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
