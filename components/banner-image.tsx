"use client";

import Image from "next/image";

import { useTheme } from "next-themes";

function BannerImage() {
  const { theme, systemTheme } = useTheme();

  const activeTheme = theme === "system" ? systemTheme : theme || "light";

  return (
    <Image
      src={`/banner-demo-${activeTheme}.png`}
      alt="Cricket Scorer demo"
      width={320}
      height={800}
      className="size-full max-md:mx-auto"
    />
  );
}

export default BannerImage;
