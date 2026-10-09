"use client";

import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { FaQuoteLeft } from "react-icons/fa";

const SecondAbout = ({ showLink = true }: { showLink?: boolean }) => {
    return (
        <div className="px-6 lg:px-32 py-24 grid lg:grid-cols-5 gap-14 items-center">
            <section className="lg:col-span-2 flex justify-center lg:order-2" data-aos="fade-left">
                <div className="relative w-9/12 lg:w-10/12">
                    <div
                        className="absolute inset-0 translate-x-4 translate-y-4 bg-gradient-to-br from-dihliz-500 to-lime-500"
                        style={{ borderRadius: "10% 30% 10% 30%" }}
                    ></div>
                    <img
                        src="/img/director.jpg"
                        className="relative w-full shadow-xl"
                        style={{ borderRadius: "10% 30% 10% 30%" }}
                        alt="Director of Dihliz World School"
                    />
                </div>
            </section>

            <section className="lg:col-span-3 lg:order-1" data-aos="fade-right">
                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900">
                    <span className="text-dihliz-500">Director&apos;s</span> Message
                </h2>
                <FaQuoteLeft className="mt-8 text-5xl text-lime-500/40" />
                <blockquote className="mt-4 text-xl lg:text-2xl font-semibold leading-relaxed text-gray-800">
                    Dihliz World School prepares you to achieve your goals in the rapidly and constantly changing
                    environment of global education.
                </blockquote>
                <p className="mt-5 text-gray-500 leading-relaxed">
                    Set in a serene garden, Dihliz delivers the competitive advantages and global experience of
                    commerce, science and high school. The need of the hour, to mould ethically inspired professionals
                    and leaders, is met through the Islamic value system at this garden of innovative mission and
                    practical wisdom.
                </p>
                {showLink && (
                    <Link href="/about" className="btn btn-primary text-white rounded-full px-7 gap-2 mt-8">
                        Read More <BsArrowRight />
                    </Link>
                )}
            </section>
        </div>
    );
};

export default SecondAbout;
