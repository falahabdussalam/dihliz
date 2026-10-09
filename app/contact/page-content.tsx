"use client";

import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHero from "@/components/common/page_hero";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

const contacts = [
    {
        title: "Visit Us",
        lines: ["Markaz Garden, Poonoor", "Calicut, Kerala, India 673574"],
        icon: HiOutlineLocationMarker,
        href: "https://maps.google.com/?q=Markaz+Garden+Dihliz+World+School",
        action: "Get directions",
    },
    {
        title: "Call Us",
        lines: ["0495 2963484"],
        icon: HiOutlinePhone,
        href: "tel:04952963484",
        action: "Call now",
    },
    {
        title: "Email Us",
        lines: ["info@dihlizworldschool.com"],
        icon: HiOutlineMail,
        href: "mailto:info@dihlizworldschool.com",
        action: "Send an email",
    },
];

const Contact = () => {
    return (
        <div className="overflow-x-hidden bg-white">
            <NavBar active="Contact"/>
            <PageHero
                crumb="Contact"
                title={<>Get in <span className="text-lime-500">touch</span></>}
                subtitle="Questions about admissions, academics or campus life? We'd love to hear from you."
            />

            <section className="relative z-10 -mt-14 px-6 lg:px-32 grid md:grid-cols-3 gap-6">
                {contacts.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.title}
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            className="group rounded-3xl bg-white p-8 shadow-xl shadow-black/5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dihliz-500/10 text-3xl text-dihliz-500 transition-colors duration-300 group-hover:bg-dihliz-500 group-hover:text-white">
                                <Icon />
                            </span>
                            <h3 className="mt-6 text-xl font-extrabold text-gray-900">{item.title}</h3>
                            {item.lines.map((line) => (
                                <p key={line} className="mt-1 text-gray-600 break-words">{line}</p>
                            ))}
                            <span className="mt-4 inline-block text-sm font-bold text-dihliz-500">{item.action} →</span>
                        </a>
                    );
                })}
            </section>

            <section className="px-6 lg:px-32 py-24">
                <div className="overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-xl shadow-black/5" data-aos="fade-up">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31284.865352773886!2d75.904566!3d11.43596!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x8f0dcbc58941b5cb!2sMarkaz%20Garden%20%7C%20Dihliz%20World%20School!5e0!3m2!1sen!2sin!4v1676036758575!5m2!1sen!2sin"
                        className="block w-full h-80 lg:h-[28rem]"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Dihliz World School on Google Maps"
                    ></iframe>
                </div>
            </section>

            <Footer/>
        </div>
    );
}

export default Contact;
