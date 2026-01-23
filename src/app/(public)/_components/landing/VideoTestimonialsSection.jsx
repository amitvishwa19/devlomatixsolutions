import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Quote } from "lucide-react";

const videoTestimonials = [
  {
    id: 1,
    name: "Dr. Suresh Kumar",
    role: "Medical Director",
    hospital: "Sunshine Multi-Specialty Hospital",
    location: "Chennai",
    thumbnail: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "CareWell HMS reduced our patient wait time by 40%. The staff loves how intuitive it is.",
  },
  {
    id: 2,
    name: "Mrs. Anita Desai",
    role: "CEO",
    hospital: "LifeCare Hospital Group",
    location: "Pune",
    thumbnail: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "Scaling to 5 branches was seamless. The multi-location support is truly enterprise-grade.",
  },
  {
    id: 3,
    name: "Dr. Rajiv Menon",
    role: "Chief Administrator",
    hospital: "Kerala Medical Center",
    location: "Kochi",
    thumbnail: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    quote: "The pathology and radiology integration saved us 20 hours per week in reporting.",
  },
];

const VideoTestimonialsSection = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Video Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hear From Our Customers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch hospital leaders share their experience with CareWell HMS
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-background rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                {/* Video Thumbnail */}
                <div 
                  className="relative aspect-video cursor-pointer overflow-hidden"
                  onClick={() => setActiveVideo(testimonial)}
                >
                  <img
                    src={testimonial.thumbnail}
                    alt={testimonial.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-3" />
                  <p className="text-sm text-muted-foreground italic mb-4 line-clamp-3">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.hospital}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors z-10"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                title={`${activeVideo.name} testimonial`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoTestimonialsSection;
