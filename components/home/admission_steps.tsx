import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { FaClipboardCheck, FaComments, FaUserGraduate } from "react-icons/fa";
import SectionTitle from "./section_title";

const steps = [
    { title: "Online Application", description: "Register on the admission portal and submit your application.", icon: FaClipboardCheck },
    { title: "Written Test", description: "Shortlisted applicants appear for an entrance written test.", icon: FaUserGraduate },
    { title: "Face to Face Interview", description: "A personal interview, followed by confirmation via official mail.", icon: FaComments },
];

const AdmissionSteps = ({ ctaHref = "/admission" }: { ctaHref?: string }) => {
    return (
        <div className="bg-lime-50 px-6 lg:px-32 py-24">
            <SectionTitle
                title={<>Your path to <span className="text-dihliz-500">Dihliz</span> in three steps</>}
                subtitle="Every applicant goes through each phase. There is no sideway entry into any of our courses."
            />

            <div className="relative grid md:grid-cols-3 gap-8">
                <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-dihliz-500/30"></div>
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.title} className="relative text-center" data-aos="fade-up" data-aos-delay={index * 150}>
                            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-dihliz-500 shadow-lg ring-4 ring-lime-50">
                                <Icon />
                                <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-lime-500 text-xs font-extrabold text-white">
                                    {index + 1}
                                </span>
                            </div>
                            <h3 className="mt-6 text-xl font-extrabold text-gray-900">{step.title}</h3>
                            <p className="mt-2 mx-auto max-w-xs text-sm text-gray-500 leading-relaxed">{step.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-14 text-center" data-aos="fade-up">
                <Link href={ctaHref} className="btn btn-primary text-white rounded-full px-8 gap-2 shadow-lg shadow-dihliz-500/20">
                    Go to Admission Portal <BsArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default AdmissionSteps;
