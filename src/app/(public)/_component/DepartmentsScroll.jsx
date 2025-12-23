
import React from 'react'
import { Loader } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from '@/components/ui/card'

export default function DepartmentsScroll() {
    return (
        <div className=" bg-white">
            <Carousel
                className="w-full container mx-auto"
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 2000,
                    }),
                ]}
            >
                <CarouselContent className="flex flex-row items-center justify-start gap-4 p-4">
                    {Array.from({ length: 15 }).map((_, index) => (
                        <CarouselItem
                            key={index}
                            className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/8 xl:basis-1/5 pl-2 md:pl-4 flex-shrink-0"
                        >
                            <Item />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

        </div>
    )
}




const Item = () => {
    return (
        <div className="flex flex-row items-center gap-4 w-full min-w-0 p-4 bg-white/80 backdrop-blur-sm  transition-all duration-300 ">
            <h2 className="text-xl md:text-2xl font-bold text-sky-500 truncate">
                Dermatology
            </h2>
            <Loader className="animate-spin [animation-duration:4s] text-[#041C33] flex-shrink-0" size={24} />
        </div>
    )
}