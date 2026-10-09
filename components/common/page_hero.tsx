import Link from "next/link";

type Props = {
    title: React.ReactNode;
    subtitle?: string;
    crumb: string;
    image?: string;
};

const PageHero = ({ title, subtitle, crumb, image = "/img/bg.jpg" }: Props) => {
    return (
        <div className="relative overflow-hidden bg-forest-900 px-6 lg:px-32 pt-20 pb-28">
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-900 via-forest-900/85 to-forest-900/40"></div>
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-dihliz-500/20 blur-3xl"></div>

            <div className="relative max-w-2xl" data-aos="fade-up">
                <nav className="flex items-center gap-2 text-sm text-white/60">
                    <Link href="/" className="hover:text-white">Home</Link>
                    <span>/</span>
                    <span className="text-lime-500">{crumb}</span>
                </nav>
                <h1 className="mt-5 text-4xl lg:text-6xl font-extrabold leading-tight text-white">{title}</h1>
                {subtitle && <p className="mt-5 text-lg leading-relaxed text-white/75">{subtitle}</p>}
            </div>
        </div>
    );
};

export default PageHero;
