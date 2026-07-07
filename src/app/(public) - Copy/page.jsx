import React from "react";
import SiteHeroSection from "./_components/SiteHeroSection";
import VibrantBanner from "./_components/VibrantBanner";
import ProductsSection from "./_components/ProductsSection";
import SiteCrystalOfTheDay from "./_components/SiteCrystalOfTheDay";
import SiteCrystalQuiz from "./_components/SiteCrystalQuiz";
import SiteChakraMap from "./_components/SiteChakraMap";
import SiteInstagramFeed from "./_components/SiteInstagramFeed";

export default function CrystalAuraHomePage() {
  return (
    <div className="bg-background">
      <SiteHeroSection />
      <VibrantBanner />
      <ProductsSection />
      <SiteCrystalOfTheDay />
      <SiteCrystalQuiz />
      <SiteChakraMap />
      <SiteInstagramFeed />
    </div>
  );
}
