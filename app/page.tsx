import Image from "next/image";
import Hero from "./components/Sections/Hero";
import Categories from "./components/ui/Categories";
import { DealOfTheDay, FreshProducts, MainFeatures, PromoBanners, ShopMore } from "./components/Sections";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <Categories />
      <PromoBanners />
      <DealOfTheDay />
      <FreshProducts />
      <MainFeatures />
      <ShopMore />
    </div>
  );
}
