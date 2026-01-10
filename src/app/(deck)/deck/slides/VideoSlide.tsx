import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Video,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const demoVideos = [
  {
    id: 1,
    title: "Complete HMS Walkthrough",
    duration: "8:45",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=225&fit=crop",
    description: "Full product tour covering all modules"
  },
  {
    id: 2,
    title: "Patient Registration Demo",
    duration: "3:20",
    thumbnail: "https://images.unsplash.com/photo-1666214280577-5f1c35c45b1a?w=400&h=225&fit=crop",
    description: "Quick registration and ID generation"
  },
  {
    id: 3,
    title: "EMR Features",
    duration: "5:15",
    thumbnail: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=225&fit=crop",
    description: "Electronic medical records in action"
  },
  {
    id: 4,
    title: "Reports & Analytics",
    duration: "4:30",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    description: "Dashboard and reporting capabilities"
  },
];

const highlights = [
  "Real hospital environment recordings",
  "Step-by-step workflows",
  "Actual user interface demos",
  "Available in multiple languages"
];

const VideoSlide = () => {
  const [selectedVideo, setSelectedVideo] = useState(demoVideos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Video className="w-4 h-4" />
          <span className="text-sm font-medium">Product Demos</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          See HMS in Action
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Watch real demonstrations of our hospital management system
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="relative rounded-2xl overflow-hidden glass-effect">
            {/* Video Thumbnail/Player */}
            <div className="relative aspect-video bg-muted">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-background/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayClick}
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </motion.div>
              </div>

              {/* Progress Bar (simulated) */}
              {isPlaying && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary origin-left"
                />
              )}
            </div>

            {/* Controls */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{selectedVideo.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {selectedVideo.duration}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon">
                  <Maximize className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsPlaying(false)}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex flex-wrap gap-3"
          >
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm"
              >
                <CheckCircle className="w-3 h-3" />
                {highlight}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Video Playlist */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Demo Videos
          </h3>
          {demoVideos.map((video, index) => (
            <motion.button
              key={video.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => {
                setSelectedVideo(video);
                setIsPlaying(false);
              }}
              className={`w-full p-3 rounded-xl border transition-all text-left group ${selectedVideo.id === video.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card/50 hover:bg-card hover:border-primary/50"
                }`}
            >
              <div className="flex gap-3">
                <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/80 text-xs text-foreground">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {video.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/20 mt-4"
          >
            <p className="text-sm text-foreground mb-2">
              Want a personalized demo?
            </p>
            <Button className="w-full" size="sm">
              Schedule Live Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoSlide;
