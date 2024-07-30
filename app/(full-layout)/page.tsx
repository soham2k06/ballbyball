import Image from "next/image";
import Link from "next/link";

import {
  AreaChart,
  BadgeIndianRupee,
  Component,
  Github,
  SmilePlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import GlimpseCarousel from "@/components/GlimpseCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    Icon: SmilePlus,
    title: "User-Friendly Interface",
    description:
      "BallByBall offers an interface that simplifies the cricket scoring process.",
  },
  {
    Icon: Component,
    title: "Comprehensive Features",
    description:
      "Add players, teams, and matches with ease. Keep track of the score ball by ball",
  },
  {
    Icon: BadgeIndianRupee,
    title: "Free Service",
    description:
      "Completely free to use, Simply sign in and start scoring your matches.",
  },
  {
    Icon: AreaChart,
    title: "Various analytics",
    description:
      "Visualize your cricket scores with Worm Chart, Runrate Chart, and Player Stats.",
  },
];

async function page() {
  return (
    <>
      <section className="flex items-center justify-between gap-12 pt-8 max-md:flex-col md:pt-8 lg:pt-16">
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-6xl lg:leading-[1.1]">
            Cricket Scoring Made Easy
          </h1>
          <span className="max-w-[568px] text-lg text-muted-foreground sm:text-xl">
            Make Every Match More Memorable: Share Your Cricket Scores and
            Relive the Excitement with Friends and Teammates
          </span>

          <div className="flex w-full items-center space-x-4 md:pb-10">
            <Button asChild>
              <Link href="/guide">Browse</Link>
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

        <div className="ml-8 aspect-[1/2] w-80 bg-muted">
          <Image
            src="/banner-demo-dark.png"
            alt="Cricket Scorer demo"
            width={320}
            height={800}
            className="size-full rounded-lg max-md:mx-auto max-md:hidden"
          />
        </div>
      </section>

      <div className="sr-only">
        <h2>BallByBall</h2>
        <h2>Cricket scoring</h2>
        <h2>Your cricket partner</h2>
        <p>
          BallByBall is a cricket scoring app that makes scoring matches easy
          and fun. Share your scores and relive the excitement with friends and
          teammates.
        </p>
      </div>
      <section className="pt-8 md:pt-8 lg:pt-16">
        <div className="mb-4 flex max-w-3xl flex-col gap-2 md:mb-8">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:leading-[1.1]">
            Visualize Your Cricket Scores
          </h2>
          <span className="max-w-[568px] text-lg text-muted-foreground sm:text-xl">
            Explore BallByBall: A Visual Journey Through Cricket Stats
          </span>
        </div>

        <div className="flex gap-6 max-md:hidden">
          <div className="aspect-[1/2] w-80 overflow-hidden rounded-md bg-muted">
            <Image
              src="/worm-chart.png"
              alt="worm chart demo"
              width={320}
              height={800}
              className="size-full max-md:mx-auto max-md:hidden"
            />
          </div>
          <div className="aspect-[1/2] w-80 overflow-hidden rounded-md bg-muted">
            <Image
              src="/runrate-chart.png"
              alt="runrate chart demo"
              width={320}
              height={800}
              className="size-full max-md:mx-auto max-md:hidden"
            />
          </div>
          <div className="aspect-[1/2] w-80 overflow-hidden rounded-md bg-muted">
            <Image
              src="/player-stats.png"
              alt="player stats demo"
              width={320}
              height={800}
              className="size-full max-md:mx-auto max-md:hidden"
            />
          </div>
        </div>
        <div className="md:hidden">
          <GlimpseCarousel />
        </div>
      </section>
      <section className="pt-8 text-xl tracking-wide text-muted-foreground md:pt-8 lg:pt-16">
        <p className="mb-4">
          Cricket scoring has never been easier with BallByBall, your ultimate
          cricket scoring partner. Our platform allows you to effortlessly add
          players, teams, and matches, and keep track of the score ball by ball.
          Whether you're playing a friendly match or an intense tournament,
          BallByBall ensures that every moment is recorded accurately and
          conveniently. Share the scorecard with your friends and teammates, and
          relive the excitement of every match with ease.
        </p>
        <p className="mb-4">
          With BallByBall, you don't need to worry about complex setups or
          hidden fees. Our service is completely free, providing you with all
          the tools you need to manage your cricket scoring efficiently. Simply
          sign in and start scoring – it's that simple! The intuitive interface
          and comprehensive features make BallByBall the perfect choice for both
          amateur cricketers and seasoned professionals. Cheers to making every
          match memorable with BallByBall!
        </p>
        <p>
          From detailed scorecards to real-time updates, BallByBall covers all
          your cricket scoring needs. Our platform is designed to enhance your
          cricket experience, offering features like scorecard generators,
          templates, and live scoring options. Whether you prefer using our app,
          software, or online tools, BallByBall is here to support your cricket
          journey. Join us today and see why we're the preferred cricket scoring
          partner for enthusiasts worldwide.
        </p>
      </section>
      <section className="pt-8 md:pt-8 lg:pt-16">
        <div className="mb-4 flex max-w-3xl flex-col gap-2 md:mb-8">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:leading-[1.1]">
            Why Choose BallByBall?
          </h2>
          <span className="text-lg text-muted-foreground sm:text-xl">
            Discover the Benefits of Our Cricket Scoring Platform
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {features.map(({ Icon, title, description }, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2">
                  <Icon className="size-8" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <hr className="mx-4" />
              <CardContent>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

export default page;
