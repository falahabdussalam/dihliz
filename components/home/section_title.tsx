type Props = {
    title: React.ReactNode;
    subtitle?: string;
    align?: "center" | "left";
    light?: boolean;
};

const SectionTitle = ({ title, subtitle, align = "center", light = false }: Props) => {
    const centered = align === "center";
    return (
        <div className={`${centered ? "text-center mx-auto" : ""} max-w-2xl mb-12`} data-aos="fade-up">
            <h2 className={`text-3xl lg:text-4xl font-extrabold leading-tight ${light ? "text-white" : "text-gray-900"}`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-4 leading-relaxed ${light ? "text-white/70" : "text-gray-500"}`}>{subtitle}</p>
            )}
        </div>
    );
};

export default SectionTitle;
