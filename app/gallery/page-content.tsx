"use client";

import Footer from "@/components/common/footer";
import NavBar from "@/components/common/nav";
import PageHero from "@/components/common/page_hero";
import { ROOT_URL } from "@/data/const";
import { useCallback, useEffect, useState } from "react";
import { BsChevronLeft, BsChevronRight, BsImages, BsX } from "react-icons/bs";

const Gallery = ({contents}:{contents:any})=>{
    const galleryItems: Array<any> = contents.status === 'available' ? contents.data : [];
    const [current, setCurrent] = useState<number | null>(null);

    const close = useCallback(() => setCurrent(null), []);
    const step = useCallback((dir: number) => {
        setCurrent((i) => i === null ? i : (i + dir + galleryItems.length) % galleryItems.length);
    }, [galleryItems.length]);

    useEffect(() => {
        if (current === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [current, close, step]);

    const src = (item: any) => ROOT_URL + "/gallery/" + item.image_link;

    return (
        <div className="overflow-x-hidden bg-white">
            <NavBar active="Gallery"/>
            <PageHero
                crumb="Gallery"
                image="/img/header.jpg"
                title={<>Life at <span className="text-lime-500">Dihliz</span></>}
                subtitle="Moments from our classrooms, campus, celebrations and everything in between."
            />

            <section className="px-6 lg:px-32 py-20">
                {galleryItems.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <BsImages className="mx-auto text-5xl text-dihliz-500/40" />
                        <p className="mt-4">Photos will be added soon.</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                        {galleryItems.map((item: any, index: number) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => setCurrent(index)}
                                className="group relative mb-5 block w-full overflow-hidden rounded-2xl bg-lime-50 break-inside-avoid"
                                aria-label={`Open photo ${index + 1}`}
                            >
                                <img
                                    src={src(item)}
                                    loading="lazy"
                                    className="w-full transition-transform duration-500 group-hover:scale-105"
                                    alt=""
                                />
                                <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/30"></span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {current !== null && galleryItems[current] && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4" onClick={close}>
                    <img
                        src={src(galleryItems[current])}
                        className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        alt=""
                    />
                    <button type="button" aria-label="Close" onClick={close}
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20">
                        <BsX />
                    </button>
                    {galleryItems.length > 1 && (
                        <>
                            <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
                                <BsChevronLeft />
                            </button>
                            <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
                                <BsChevronRight />
                            </button>
                        </>
                    )}
                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70">
                        {current + 1} / {galleryItems.length}
                    </span>
                </div>
            )}

            <Footer/>
        </div>
    );
}

export default Gallery;
