import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

const ContactCta = () => {
    return (
        <div className="bg-white px-6 lg:px-32 pb-24">
            <div
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dihliz-500 to-dihliz-600 px-8 py-14 lg:px-16"
                data-aos="zoom-in"
            >
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-lime-500/30"></div>
                <img src="/img/white.png" alt="" className="absolute right-10 bottom-6 hidden lg:block w-40 opacity-10" />

                <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                            Step across the threshold.
                            <br />
                            <span className="text-lime-50/80">Begin your journey at Dihliz.</span>
                        </h2>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/admission" className="btn rounded-full px-7 gap-2 bg-white text-dihliz-600 hover:bg-lime-50">
                                Apply Now <BsArrowRight />
                            </Link>
                            <Link href="/contact" className="btn rounded-full px-7 bg-transparent text-white border border-white/40 hover:bg-white/10">
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    <ul className="space-y-4 text-white">
                        <li className="flex items-start gap-4">
                            <HiOutlineLocationMarker className="mt-0.5 text-2xl shrink-0 text-lime-50" />
                            <span>Markaz Garden, Poonoor, Calicut, Kerala, India 673574</span>
                        </li>
                        <li>
                            <a href="tel:04952963484" className="flex items-center gap-4 hover:underline">
                                <HiOutlinePhone className="text-2xl shrink-0 text-lime-50" />
                                0495 2963484
                            </a>
                        </li>
                        <li>
                            <a href="mailto:info@dihlizworldschool.com" className="flex items-center gap-4 hover:underline">
                                <HiOutlineMail className="text-2xl shrink-0 text-lime-50" />
                                info@dihlizworldschool.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ContactCta;
