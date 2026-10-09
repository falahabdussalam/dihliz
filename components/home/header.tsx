"use client";

import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

const HomeHeader = () => {
    return (
        <div className="relative w-full overflow-hidden bg-black min-h-[calc(100svh-5rem)] flex items-center">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/img/bg.jpg')" }}
            ></div>
            <video
                autoPlay
                muted
                loop
                playsInline
                poster="/img/bg.jpg"
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source src="/bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 backdrop-blur-[6px] bg-gradient-to-b from-black/75 via-black/65 to-forest-900/95"></div>

            <section className="relative w-full px-6 lg:px-32 py-24 text-center">
                <img
                    src="/img/white.png"
                    className="w-24 lg:w-28 mx-auto"
                    data-aos="fade-down"
                    data-aos-delay="200"
                    alt="Dihliz World School"
                />
                <h1
                    className="mt-8 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
                    data-aos="fade-down"
                    data-aos-delay="400"
                >
                    A Global Gateway to <br className="hidden md:block" />
                    <span className="text-lime-500">Cutting-Edge</span> Schooling
                </h1>
                <p
                    className="mt-5 mx-auto max-w-2xl text-white/80 text-base lg:text-lg leading-relaxed"
                    data-aos="fade-down"
                    data-aos-delay="600"
                >
                    Creating, moulding and developing ethically sound professionals through an outstanding
                    residential curriculum rooted in values.
                </p>

                <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center" data-aos="fade-up" data-aos-delay="800">
                    <Link
                        href="/admission"
                        className="btn btn-primary text-white rounded-full px-8 gap-2 shadow-lg shadow-dihliz-500/30"
                    >
                        Apply for Admission <BsArrowRight />
                    </Link>
                    <a
                        href="#about"
                        className="btn rounded-full px-8 bg-white/10 text-white border border-white/30 hover:bg-white hover:text-dihliz-600 backdrop-blur"
                    >
                        Explore Dihliz
                    </a>
                </div>
            </section>

            <a
                href="#about"
                aria-label="Scroll down"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex h-11 w-7 items-start justify-center rounded-full border-2 border-white/50 p-1.5"
            >
                <span className="h-2 w-1 rounded-full bg-white animate-bounce"></span>
            </a>
        </div>
    );
};

export default HomeHeader;
