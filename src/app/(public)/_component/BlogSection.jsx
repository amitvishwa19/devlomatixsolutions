import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

import { Poppins, Unbounded } from 'next/font/google'
const unbounded = Unbounded({ subsets: ["latin"] });

const blogPosts = [
    {
        id: 1,
        title: "Understanding Heart Health: Prevention Tips for a Stronger Heart",
        excerpt: "Learn about the latest advances in cardiovascular care and simple lifestyle changes that can significantly reduce your risk of heart disease.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
        category: "Cardiology",
        date: "Dec 20, 2025",
        readTime: "5 min read",
    },
    {
        id: 2,
        title: "The Importance of Regular Health Checkups After 40",
        excerpt: "Discover why preventive health screenings become crucial as you age and which tests you should prioritize for optimal wellness.",
        image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=250&fit=crop",
        category: "Preventive Care",
        date: "Dec 18, 2025",
        readTime: "4 min read",
    },
    {
        id: 3,
        title: "Managing Diabetes: New Treatment Options Available",
        excerpt: "Explore the latest breakthrough treatments and management strategies for diabetes that are changing patients' lives worldwide.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop",
        category: "Endocrinology",
        date: "Dec 15, 2025",
        readTime: "6 min read",
    },
    ,
    {
        id: 4,
        title: "The Importance of Regular Health Checkups After 40",
        excerpt: "Discover why preventive health screenings become crucial as you age and which tests you should prioritize for optimal wellness.",
        image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=250&fit=crop",
        category: "Preventive Care",
        date: "Dec 18, 2025",
        readTime: "4 min read",
    },
    {
        id: 5,
        title: "Managing Diabetes: New Treatment Options Available",
        excerpt: "Explore the latest breakthrough treatments and management strategies for diabetes that are changing patients' lives worldwide.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop",
        category: "Endocrinology",
        date: "Dec 15, 2025",
        readTime: "6 min read",
    },
];


export default function BlogSection() {
    return (

        <section className={`${unbounded.className}`}>
            <div className="container mx-auto p-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                            Health Insights
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                            Read Our Latest Insight From Recent Blogs
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Stay informed with the latest health tips, medical breakthroughs, and wellness advice from our experts.
                        </p>
                    </div>
                    <Button variant="outline" className="self-start md:self-auto gap-2">
                        View All Articles
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Scrollable Blog Posts */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {/* <div className="flex gap-6 min-w-max">
                        {blogPosts.map((post, index) => (
                            <Article key={index} post={post} index={index} />
                        ))}
                    </div> */}
                    <Carousel
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
                        <CarouselContent className='flex flex-row items-center justify-between'>
                            {blogPosts?.map((post, index) => {

                                return (

                                    <CarouselItem key={post?.id} className="md:basis-1/2 lg:basis-1/3">
                                        <Article post={post} index={index} />
                                    </CarouselItem>

                                )
                            })}

                        </CarouselContent>
                    </Carousel>
                </div>

                {/* Scroll Indicator */}
                <div className="flex justify-center mt-6 md:hidden">
                    <div className="flex gap-1.5">
                        {blogPosts.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary" : "bg-primary/30"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>

    )
}


const Article = ({ post, index }) => {
    return (

        <article
            key={post.id}
            className="group  bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-elegant transition-all duration-300 animate-fade-in flex-shrink-0 "
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {post.category}
                </span>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                <Button
                    variant="ghost"
                    className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent gap-1.5 font-medium"
                >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </article>

    )
}