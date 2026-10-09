const stats = [
    { value: "10+", label: "Years of GSV legacy" },
    { value: "4", label: "Academic streams" },
    { value: "CBSE", label: "High school curriculum" },
    { value: "24×7", label: "Residential mentoring" },
];

const Stats = () => {
    return (
        <div className="relative z-10 px-6 lg:px-32 -mt-14">
            <div
                className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 overflow-hidden"
                data-aos="fade-up"
            >
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`px-6 py-7 text-center ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} lg:border-r last:border-r-0 border-gray-100`}
                    >
                        <div className="text-3xl lg:text-4xl font-extrabold text-dihliz-500">{stat.value}</div>
                        <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stats;
