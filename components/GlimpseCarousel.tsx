"use client";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

function GlimpseCarousel() {
  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      <CarouselContent>
        <CarouselItem>
          <Image
            src="/worm-chart.png"
            alt="demo"
            width={320}
            height={100}
            className="mx-8 rounded-lg max-md:mx-auto max-md:w-3/5"
          />
        </CarouselItem>
        <CarouselItem>
          <Image
            src="/runrate-chart.png"
            alt="demo"
            width={320}
            height={100}
            className="mx-8 rounded-lg max-md:mx-auto max-md:w-3/5"
          />
        </CarouselItem>
        <CarouselItem>
          <Image
            src="/player-stats.png"
            alt="demo"
            width={320}
            height={100}
            className="mx-8 rounded-lg max-md:mx-auto max-md:w-3/5"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

export default GlimpseCarousel;
