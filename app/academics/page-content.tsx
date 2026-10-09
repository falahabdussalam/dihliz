"use client";

import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHero from "@/components/common/page_hero";
import ContactCta from "@/components/home/contact_cta";
import SectionTitle from "@/components/home/section_title";
import { BsArrowUpRight, BsCheck2 } from "react-icons/bs";
import { FaLaptopCode, FaQuran, FaUsers } from "react-icons/fa";

const pillars = [
    { title: "Future-ready skills", description: "AI, Robotics and competitive exam coaching", icon: FaLaptopCode },
    { title: "Integrated Islamic studies", description: "Woven into every academic stream", icon: FaQuran },
    { title: "24×7 mentoring", description: "Personal guidance in a residential campus", icon: FaUsers },
];

const courses = [
    {
        id: "high-school",
        name: "High School",
        tag: "CBSE",
        sub: "With life skills training and competitive exam coaching",
        img: "highschool.jpg",
        body: "An integrated Islamic secondary curriculum that shapes students to be scientifically, academically, socially and religiously adept, and ready for future academic endeavours.",
        features: [
            "CBSE Curriculum",
            "Comprehensively Integrated Islamic Studies",
            "Qur'anic Studio for Qur'an learning",
            "Language Lab",
            "AI, Robotics & National Science Olympiad coaching",
            "NTSE & Civil Service orientation",
            "'Speed Math' program",
            "Soft skill training",
            "Martial Arts",
            "Reading, creative writing & public speaking",
            "24×7 mentoring system",
            "Islamic lifestyle",
        ],
    },
    {
        id: "science",
        name: "Higher Secondary Science",
        tag: "Plus One & Two",
        sub: "With medical and engineering coaching",
        img: "hssscience.jpg",
        body: "Different flavours of the science stream under well-qualified faculty in a peaceful, vibrant campus. Our students' results in entrance exams like JEE and NEET reflect the quality of teaching and learning.",
        features: [
            "Training for KEAM, NEET, JEE-IIT, JIPMER, IIIT",
            "Classes by IIT & NIT professors, scientists and academicians",
            "Preparation for premier national & international institutes",
            "Special training in AI & Robotics",
            "IELTS / TOEFL training",
            "NCPL Urdu & Arabic (Central Govt.) certificate",
            "Qur'anic Studio for Qur'an / Tajwid learning",
            "Language Lab",
            "Soft skills, creative writing, public speaking & research",
            "Arts, sports, martial arts & visits",
            "24×7 mentoring system",
        ],
    },
    {
        id: "commerce",
        name: "Higher Secondary Commerce",
        tag: "Plus One & Two",
        sub: "With CA, CS and CMA foundation",
        img: "hsscommerce.jpg",
        body: "A high range of managerial and leadership acumen, with outstanding career advantages for future professionals and entrepreneurs.",
        features: [
            "CA / CMA / CS foundation coaching",
            "IELTS / TOEFL training",
            "NCPL Urdu & Arabic (Central Govt.) certificate",
            "Qur'anic Studio",
            "Comprehensively Integrated Islamic Studies",
            "Soft skills, public speaking & creative writing",
            "Arts, sports & martial arts",
            "Guidance by professionals, business leaders & professors",
            "Industrial visits, corporate training & management summits",
            "Integrated Islamic Management & Leadership Program",
            "24×7 mentoring system",
        ],
    },
    {
        id: "islamic-science",
        name: "Islamic Science",
        tag: "Integrated",
        sub: "With a submissive heart and soul",
        img: "islamicscience.jpg",
        body: "Life at Dihliz under the Markaz Garden Islamic Department moulds each student with the best of what Allah has instructed: justice, kindness and good conduct. Students learn the textual and practical wisdom of Islam directly from scholars, with a focus on the Arabic language.",
        features: [
            "Learning directly from Islamic scholars",
            "Focus on the Arabic language",
            "Textual and practical wisdom of Islam",
            "Authentic knowledge in religious fields",
        ],
    },
];

const Academics = () => {
    return (
        <div className="overflow-x-hidden bg-white">
            <NavBar active="Academics"/>
            <PageHero
                crumb="Academics"
                image="/img/academics/hssscience.jpg"
                title={<>Academics at <span className="text-lime-500">Dihliz</span></>}
                subtitle="Futuristic, productive methodology over the conventional, with curricula designed around the careers of tomorrow."
            />

            {/* Intro */}
            <section className="relative overflow-hidden px-6 lg:px-32 py-24 grid lg:grid-cols-12 gap-14 items-center">
                <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-lime-50 blur-2xl"></div>

                <div className="relative lg:col-span-5" data-aos="fade-right">
                    <h2 className="text-3xl lg:text-[2.6rem] font-extrabold leading-tight text-gray-900">
                        Learning for the <span className="text-dihliz-500">age of AI</span>
                    </h2>
                    <p className="mt-6 text-gray-600 leading-relaxed">
                        We teach children what things are, why they are, and how they work, with strategies that are
                        futuristic and practical, not merely theoretical.
                    </p>

                    <ul className="mt-8 space-y-5">
                        {pillars.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <li key={pillar.title} className="flex items-start gap-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-dihliz-500/10 text-xl text-dihliz-500">
                                        <Icon />
                                    </span>
                                    <span>
                                        <span className="block font-extrabold text-gray-900">{pillar.title}</span>
                                        <span className="block text-sm text-gray-500">{pillar.description}</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="relative lg:col-span-7 grid grid-cols-2 gap-4 lg:gap-5" data-aos="fade-left">
                    {courses.map((course, index) => (
                        <a
                            key={course.id}
                            href={`#${course.id}`}
                            className={`group relative block h-56 sm:h-72 overflow-hidden rounded-3xl shadow-lg shadow-forest-900/10 ${index % 2 === 1 ? "sm:translate-y-10" : ""}`}
                        >
                            <img
                                src={`/img/academics/${course.img}`}
                                alt={course.name}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-forest-900/95 via-forest-900/30 to-transparent"></span>
                            <span className="absolute left-5 top-5 text-sm font-extrabold text-white/80">0{index + 1}</span>
                            <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all duration-300 group-hover:bg-lime-500 group-hover:rotate-45">
                                <BsArrowUpRight />
                            </span>
                            <span className="absolute inset-x-0 bottom-0 p-5">
                                <span className="inline-block rounded-full bg-lime-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                                    {course.tag}
                                </span>
                                <span className="mt-3 block text-lg sm:text-xl font-extrabold leading-tight text-white">{course.name}</span>
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            <div className="flow-root bg-lime-50 px-6 lg:px-32 pt-24">
                <SectionTitle
                    title={<>Programs offered at <span className="text-dihliz-500">Dihliz</span></>}
                    subtitle="Four streams, one goal: ethically sound, globally ready graduates."
                />
            </div>

            {courses.map((course, index) => (
                <section
                    key={course.id}
                    id={course.id}
                    className={`scroll-mt-24 px-6 lg:px-32 ${index === 0 ? "pt-4 pb-20" : "py-20"} ${index % 2 === 0 ? "bg-lime-50" : "bg-white"}`}
                >
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div className={`lg:sticky lg:top-28 ${index % 2 !== 0 ? "lg:order-2" : ""}`} data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}>
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-forest-900/15">
                                <img src={`/img/academics/${course.img}`} alt={course.name} className="w-full aspect-[4/3] object-cover" />
                                <span className="absolute left-5 top-5 rounded-full bg-lime-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                                    {course.tag}
                                </span>
                            </div>
                        </div>
                        <div data-aos="fade-up">
                            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900">{course.name}</h2>
                            <p className="mt-2 text-lg font-semibold text-dihliz-500">{course.sub}</p>
                            <p className="mt-5 text-gray-600 leading-relaxed">{course.body}</p>
                            <div className={`mt-8 rounded-3xl p-6 ring-1 ring-black/5 ${index % 2 === 0 ? "bg-white" : "bg-lime-50"}`}>
                                <h3 className="text-sm font-extrabold text-gray-900">Program highlights</h3>
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {course.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-gray-700 ring-1 ${index % 2 === 0 ? "bg-lime-50 ring-lime-500/20" : "bg-white ring-black/5"}`}
                                        >
                                            <BsCheck2 className="shrink-0 text-dihliz-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            <div className="pt-24">
                <ContactCta/>
            </div>
            <Footer/>
        </div>
    );
}

export default Academics;
