import SectionTitle from "./section_title";

const team = [
    { name: "Dr. MAH Azhari", img: "mah.jpg" },
    { name: "Dr. Abdussalam", img: "dr-abdussalam.jpg" },
    { name: "Dr. Umarul Faruq Saqafi", img: "farooq-saqafi.jpg" },
    { name: "Dr. Anil Seth", img: "anil-seth.jpg" },
    { name: "Mr. Noufal Hassan Nurani", img: "noufal.jpg" },
];

const Leadership = () => {
    return (
        <div className="bg-white px-6 lg:px-32 py-24">
            <SectionTitle
                title={<>Our <span className="text-dihliz-500">Directors Board</span></>}
                subtitle="Guided by scholars, academicians and professionals committed to the Dihliz vision."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {team.map((member, index) => (
                    <div key={member.name} className="group text-center" data-aos="fade-up" data-aos-delay={index * 80}>
                        <div className="relative mx-auto aspect-square w-full max-w-[11rem] overflow-hidden rounded-3xl bg-lime-50 ring-1 ring-black/5">
                            <img
                                src={`/img/directors/${member.img}`}
                                alt={member.name}
                                className="h-full w-full object-cover grayscale-[30%] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                            />
                        </div>
                        <h3 className="mt-4 font-extrabold text-gray-900">{member.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leadership;
