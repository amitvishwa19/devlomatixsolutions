import { Activity, Heart, Users, Shield } from "lucide-react";

const LoadingScreen = ({ onComplete }) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/95 via-primary to-primary/90 overflow-hidden">
      {/* Animated Network Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Animated connection lines */}
          {[...Array(15)].map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <line
                key={`line-${i}`}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.5}s`, animationDuration: '4s' }}
              />
            );
          })}
          
          {/* Network nodes */}
          {[...Array(20)].map((_, i) => {
            const cx = Math.random() * 100;
            const cy = Math.random() * 100;
            const size = 3 + Math.random() * 5;
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={`${cx}%`}
                  cy={`${cy}%`}
                  r={size}
                  fill="url(#nodeGlow)"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: '5s' }}
                />
                <circle
                  cx={`${cx}%`}
                  cy={`${cy}%`}
                  r={size / 2}
                  fill="white"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Healthcare Icons */}
        <div className="flex justify-center gap-6 mb-8">
          <Activity 
            className="w-10 h-10 text-white animate-bounce" 
            style={{ animationDelay: '0s', animationDuration: '2s' }}
          />
          <Heart 
            className="w-10 h-10 text-white animate-bounce" 
            style={{ animationDelay: '0.2s', animationDuration: '2s' }}
          />
          <Users 
            className="w-10 h-10 text-white animate-bounce" 
            style={{ animationDelay: '0.4s', animationDuration: '2s' }}
          />
          <Shield 
            className="w-10 h-10 text-white animate-bounce" 
            style={{ animationDelay: '0.6s', animationDuration: '2s' }}
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">
          Caring for Health Beyond Treatment.{" "}
          <span className="text-white/80">Organizing Care, Empowering Lives</span>
        </h1>

        {/* Description */}
        <p className="text-white/70 text-sm md:text-base mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Smart systems. Seamless care. Where medicine meets management. Our platform simplifies healthcare by connecting 
          people, processes, and data — ensuring every detail of patient care is perfectly organized. With intelligent tools and human-
          centered design, we help doctors focus on healing while technology takes care of the rest.
        </p>

        {/* Divider with Heart */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-0.5 bg-white/50 animate-scale-in" />
          <Heart className="w-6 h-6 text-white fill-white animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="w-16 h-0.5 bg-white/50 animate-scale-in" />
        </div>

        {/* Subtitle */}
        <p className="text-white/60 text-sm md:text-base mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Empowering healthcare providers with intelligent solutions for<br />
          patient care, resource management, and operational excellence
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12">
          <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Shield className="w-4 h-4 text-white" />
            <span>Secure & Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Activity className="w-4 h-4 text-white" />
            <span>Real-time Monitoring</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Users className="w-4 h-4 text-white" />
            <span>Patient-Centric</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Heart className="w-4 h-4 text-white" />
            <span>Compassionate Care</span>
          </div>
        </div>

      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/20" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-white/20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-white/20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/20" />
    </div>
  );
};

export default LoadingScreen;
