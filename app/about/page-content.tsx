"use client";

import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHero from "@/components/common/page_hero";
import ContactCta from "@/components/home/contact_cta";
import Leadership from "@/components/home/leadership";
import SecondAbout from "@/components/home/secondabout";
import SectionTitle from "@/components/home/section_title";
import Stats from "@/components/home/stats";
import { FaBrain, FaBullseye, FaEye, FaLanguage, FaPalette, FaPrayingHands, FaRunning } from "react-icons/fa";

const domains = [
    { title: "Cognitive", description: "Critical thinking and experiential learning", icon: FaBrain },
    { title: "Physical", description: "Sports, fitness and martial arts", icon: FaRunning },
    { title: "Aesthetic", description: "Arts, creativity and expression", icon: FaPalette },
    { title: "Spiritual", description: "Wisdom through practical understanding", icon: FaPrayingHands },
    { title: "Linguistic", description: "Arabic, Urdu, English and public speaking", icon: FaLanguage },
];

const About = () => {
    return (
        <div className="overflow-x-hidden bg-white">
            <NavBar active="About"/>
            <PageHero
                crumb="About"
                image="/img/header.jpg"
                title={<>About <span className="text-lime-500">Dihliz</span></>}
                subtitle="A residential world school under Markaz Garden, Calicut, shaping ethically sound professionals for a changing world."
            />
            <Stats/>

            {/* Story */}
            <section className="px-6 lg:px-32 py-24 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
                <div className="relative pb-12 pr-12" data-aos="fade-right">
                    <img src="/img/header.jpg" alt="Students at Dihliz World School" className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl shadow-forest-900/20" />
                    <img src="/img/about1.jpg" alt="Campus life at Dihliz" className="absolute bottom-0 right-0 w-1/2 aspect-square object-cover rounded-3xl border-[6px] border-white shadow-xl" />
                </div>
                <div data-aos="fade-left">
                    <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900">
                        A threshold to <span className="text-dihliz-500">global excellence</span>
                    </h2>
                    <p className="mt-6 text-gray-600 leading-relaxed">
                        Dihliz, a word meaning <em>threshold</em> in Persian, continues the journey that GSV started
                        more than a decade ago.
                    </p>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Running under Markaz Garden, Calicut, Dihliz World School plans its residential school system
                        with an advanced approach and an outstanding curriculum to expand its global connections. It
                        explores excellence in all academic and non-academic areas to mould students as ideal in every
                        field they pursue.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="bg-lime-50 px-6 lg:px-32 py-24">
                <SectionTitle
                    title={<>Our <span className="text-dihliz-500">Vision</span> &amp; <span className="text-dihliz-500">Mission</span></>}
                    subtitle="What guides every classroom, every mentor and every student at Dihliz."
                />
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="relative overflow-hidden rounded-3xl bg-forest-900 p-10 text-white" data-aos="fade-up">
                        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-dihliz-500/30 blur-2xl"></div>
                        <div className="relative">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-2xl">
                                <FaEye />
                            </span>
                            <h3 className="mt-6 text-2xl font-extrabold">Vision</h3>
                            <p className="mt-4 leading-relaxed text-white/75">
                                Creating, moulding and developing ethically sound professionals in their chosen fields.
                                A well-designed curriculum enlightens young scholars to become ideals who influence a
                                constantly changing world order.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-white p-10 ring-1 ring-black/5" data-aos="fade-up" data-aos-delay="150">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dihliz-500 text-2xl text-white">
                            <FaBullseye />
                        </span>
                        <h3 className="mt-6 text-2xl font-extrabold text-gray-900">Mission</h3>
                        <p className="mt-4 leading-relaxed text-gray-600">
                            Dihliz prioritises quality, values and ethos. We aim for an alternative, globally equipped
                            schooling built on experiential learning, helping students discover themselves through
                            diverse learning strategies, while the spiritual domain expands their wisdom.
                        </p>
                    </div>
                </div>
            </section>

            {/* Domains of learning */}
            <section className="px-6 lg:px-32 py-24">
                <SectionTitle
                    title={<>Five domains of <span className="text-dihliz-500">learning</span></>}
                    subtitle="Students are engaged in cognitive learning alongside the physical, aesthetic, spiritual and linguistic domains."
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {domains.map((domain, index) => {
                        const Icon = domain.icon;
                        return (
                            <div
                                key={domain.title}
                                data-aos="fade-up"
                                data-aos-delay={index * 80}
                                className="group rounded-2xl p-6 text-center ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-50 hover:ring-lime-500/30"
                            >
                                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dihliz-500/10 text-2xl text-dihliz-500 transition-colors duration-300 group-hover:bg-dihliz-500 group-hover:text-white">
                                    <Icon />
                                </span>
                                <h3 className="mt-4 font-extrabold text-gray-900">{domain.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{domain.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="bg-lime-50">
                <SecondAbout showLink={false}/>
            </div>
            <Leadership/>
            <ContactCta/>
            <Footer/>
        </div>
    );
}

export default About;
