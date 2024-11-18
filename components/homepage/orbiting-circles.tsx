import OrbitingCircles from "@/components/magicui/orbiting-circles";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import Image from "next/image";

export function OrbitingCirclesComponent() {
  return (
    <div className="relative flex h-[500px] w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-500/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Trade Smart
      </span>

      {/* Inner Circles */}
      <OrbitingCircles
        className="h-[30px] w-[30px] border-none bg-transparent"
        duration={20}
        delay={20}
        radius={80}
      >
        <Icons.typescript />
      </OrbitingCircles>
      <OrbitingCircles
        className="h-[60px] w-[70px] border-none bg-transparent"
        duration={20}
        delay={10}
        radius={80}
      >
        <Icons.Yahoo />
      </OrbitingCircles>

      {/* Outer Circles (reverse) */}
      <OrbitingCircles
        className="h-[90px] w-[90px] border-none bg-transparent"
        reverse
        radius={190}
        duration={20}
      >
        <Icons.tradingview />
      </OrbitingCircles>
      <OrbitingCircles
        className="h-[50px] w-[50px] border-none bg-transparent"
        reverse
        radius={190}
        duration={20}
        delay={20}
      >
        <Icons.spotware />
      </OrbitingCircles>
    </div>
  );
}

const Icons = {
  typescript: (props: IconProps) => (
    <Image src="https://utfs.io/f/5b51351d-218b-4931-a296-0a9275030aaf-8myeez.png" alt=""
      width={100}
      height={100}
    />
  ),
  Yahoo: (props: IconProps) => (
    <Image src="https://utfs.io/f/uZI7cs6PPAxINjkX3eYwqSaiDEIlumY9o12tVjZpxvFJK08X" alt=""
      width={100}
      height={100}
    // className="bg-black p-2 rounded"
    />
  ),
  spotware: (props: IconProps) => (
    <Image src="https://utfs.io/f/uZI7cs6PPAxIBel2yDVtR29G1gxCrnMluz0mZNkXbeDVHyFU" alt=""
      width={100}
      height={100}
    // className="bg-black p-2 rounded"
    />
  ),
  tradingview: (props: IconProps) => (
    <Image src="https://utfs.io/f/uZI7cs6PPAxIhEWq8LRT45UkbFMiSKnm0d7D3ylcCaArEIJZ" alt=""
      width={200}
      height={200}
      className="bg-black p-1 rounded"
    />
  ),
};
