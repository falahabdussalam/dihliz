import { FaBookOpen, FaLanguage, FaLaptopCode, FaMedal, FaQuran, FaUsers } from "react-icons/fa";
import SectionTitle from "./section_title";

const features = [
    { title: "Qur'anic Studio", description: "Dedicated space for Qur'an and Tajwid learning.", icon: FaQuran },
    { title: "Language Lab", description: "IELTS/TOEFL training plus NCPL Urdu & Arabic certification.", icon: FaLanguage },
    { title: "AI & Robotics", description: "Coaching in Artificial Intelligence, Robotics and Science Olympiads.", icon: FaLaptopCode },
    { title: "Arts, Sports & Martial Arts", description: "Physical and creative growth beyond the classroom.", icon: FaMedal },
    { title: "Reading & Public Speaking", description: "Intensive training in creative writing, research and oratory.", icon: FaBookOpen },
    { title: "24×7 Mentoring", description: "A residential mentoring system rooted in an Islamic lifestyle.", icon: FaUsers },
];

const CampusLife = () => {
    return (
        <div className="relative overflow-hidden bg-forest-900 px-6 lg:px-32 py-24">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-dihliz-500/20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-lime-500/10 blur-3xl"></div>

            <div className="relative grid lg:grid-cols-5 gap-12 items-center">
                <div className="lg:col-span-2" data-aos="fade-right">
                    <SectionTitle
                        light
                        align="left"
                        title={<>Learning that goes <span className="text-lime-500">beyond textbooks</span></>}
                        subtitle="Life at the Markaz Garden Global Students' Village is vibrant, peaceful and purposeful. Every day is designed to grow the mind, body and soul."
                    />
                    <div className="relative -mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
                        <img src="/img/about1.jpg" alt="Campus life at Dihliz" className="h-56 w-full object-cover" />
                    </div>
                </div>

                <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                data-aos="fade-up"
                                data-aos-delay={(index % 2) * 100}
                                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors duration-300 hover:bg-white/10"
                            >
                                <Icon className="text-3xl text-lime-500" />
                                <h3 className="mt-4 text-lg font-extrabold text-white">{feature.title}</h3>
                                <p className="mt-1 text-sm text-white/60 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CampusLife;
