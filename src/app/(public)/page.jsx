import React from "react";
import HeroSection from "./_components/HeroSection";
import ProductsSection from "./_components/ProductsSection";
import FeaturesSection from "./_components/FeaturesSection";
import TestimonialSection from "./_components/TestimonialSection";
import InstagramFeed from "./_components/InstagramFeed";

export default function CrystalAuraHomePage() {
  return (
    <div className="bg-background">
      <HeroSection />
      <ProductsSection />
      <FeaturesSection />
      <TestimonialSection />
      <InstagramFeed />
    </div>
  );
}
