"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

function page() {
  const [isFlipped, setIsFlipped] = useState(false);

  const randomToss = Math.random() < 0.5 ? "heads" : "tails";

  const handleFlip = () => {
    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min) + 1) + min;

    setIsFlipped(true);
    setTimeout(() => {
      setIsFlipped(false);
    }, random(2000, 3000));
  };

  return (
    <>
      <div
        // className={`size-24 [perspective:1000px] cursor-pointer ${
        //   isFlipped ? "animate-[rotate_.2s_infinite_linear]" : ""
        // }`}
        className={cn("size-24 [perspective:1000px] cursor-pointer", {
          "animate-[rotate_.2s_infinite_linear]": isFlipped,
        })}
      >
        {isFlipped ? (
          <>
            <div className="w-full h-full flex justify-center items-center absolute rounded-full bg-amber-500">
              <p>Heads</p>
            </div>
            <div className="w-full h-full flex justify-center items-center absolute rounded-full bg-amber-200 text-black">
              <p>Tails</p>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex justify-center items-center absolute rounded-full bg-amber-200 text-black">
            <p>{randomToss}</p>
          </div>
        )}
      </div>
      <Button onClick={handleFlip}>Flip</Button>
    </>
  );
}

export default page;
