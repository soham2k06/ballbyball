import Image from "next/image";
import Link from "next/link";

import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";

import GlimpseCarousel from "@/components/GlimpseCarousel";

export default function Home() {
  return (
    <>
      <section className="flex items-center justify-between gap-12 pt-8 max-md:flex-col md:pt-8 lg:pt-16">
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-6xl lg:leading-[1.1]">
            Cricket Scoring Made Easy
          </h1>
          <span className="max-w-[568px] text-lg text-muted-foreground sm:text-xl">
            Make Every Match More Memorable: Share your scores and relive the
            excitement with friends and teammates.
          </span>

          <div className="flex w-full items-center space-x-4 md:pb-10">
            <Button asChild>
              <Link href="/players">Browse</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="https://github.com/soham2k06/cricket-scorer">
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-foreground pt-1 text-background">
                  <Github className="size-4 fill-background" />
                </span>{" "}
                Github
              </Link>
            </Button>
          </div>
        </div>
        <Image
          src="/banner-demo-dark.png"
          alt="demo"
          width={320}
          height={100}
          className="mx-8 rounded-lg max-md:mx-auto max-md:w-11/12"
        />
      </section>
      <section className="pt-8 md:pt-8 lg:pt-16">
        <div className="mb-4 flex max-w-3xl flex-col gap-2 md:mb-8">
          {/* <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:leading-[1.1]">
            Feature Glimpse
          </h2> */}
          <span className="max-w-[568px] text-lg text-muted-foreground sm:text-xl">
            Explore BallByBall: A Visual Journey Through Cricket Stats
          </span>
        </div>

        <div className="flex w-fit gap-6 max-md:hidden">
          <div className="overflow-hidden rounded-lg border">
            <Image
              src="/worm-chart.png"
              alt="worm chart demo"
              width={320}
              height={100}
            />
            <div className="bg-muted p-1 text-center text-muted-foreground">
              Worm Chart
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Image
              src="/runrate-chart.png"
              alt="runrate chart demo"
              width={320}
              height={100}
            />
            <div className="bg-muted p-1 text-center text-muted-foreground">
              Runrate Chart
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Image
              src="/player-stats.png"
              alt="player stats demo"
              width={320}
              height={100}
            />
            <div className="bg-muted p-1 text-center text-muted-foreground">
              Player Stats
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <GlimpseCarousel />
        </div>
      </section>
    </>
  );
}
