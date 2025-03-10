import { ArrowRight, Github } from 'lucide-react';
import Link from "next/link";
import { BorderBeam } from "../magicui/border-beam";
import { Button } from "../ui/button";
import Image from 'next/image';
import { TITLE_TAILWIND_CLASS } from '@/utils/constants';
import { RainbowButton } from "@/components/magicui/rainbow-button";


export default function HeroSection() {
    return (
        <section className='flex flex-col items-center justify-center leading-6 mt-[3rem]' aria-label="Nextjs Starter Kit Hero">
            <h1 className={`${TITLE_TAILWIND_CLASS} scroll-m-20 font-semibold tracking-tight text-center max-w-[1120px] bg-gradient-to-b dark:text-white`}>
                ULTIMATE TRADING TERMINAL
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 text-center mt-2 dark:text-gray-400">
                The Ultimate tool kit for quickly building your knowledge in the markets, giving you time to focus on what really matters
            </p>
            <div className="flex justify-center items-center gap-3">
                <Link href="/dashboard" className="mt-5">
                    <RainbowButton>
                        Get Started
                    </RainbowButton>
                </Link>

                <Link
                    href="https://discord.gg/xP9CdQ6w"
                    target='_blank'
                    className="mt-5"
                    aria-label="Join Discord (opens in a new tab)"
                >
                    <Button variant="outline" className="flex gap-1">
                        Join Discord
                        <ArrowRight className='w-4 h-4' aria-hidden="true" />
                    </Button>
                </Link>
                <Link
                    href=""
                    target='_blank'
                    className='animate-buttonheartbeat border p-2 rounded-full mt-5 hover:dark:bg-black hover:cursor-pointer'
                    aria-label="View VD Capital on GitHub"
                >
                    <Github className='w-5 h-5' aria-hidden="true" />
                </Link>
            </div>
            <div>
                <div className="relative flex max-w-6xl justify-center overflow-hidden mt-7">
                    <div className="relative rounded-xl">
                        <Image
                            src="https://utfs.io/f/uZI7cs6PPAxIQbw6qSeJTsAEGma2B0wtXobxyS5vFLjPOkN6"
                            alt="Trading Terminal Dashboard Preview"
                            width={1100}
                            height={550}
                            priority={true}
                            className="block rounded-[inherit] border object-contain shadow-lg dark:hidden"
                        />
                        <Image
                            src="https://utfs.io/f/uZI7cs6PPAxIt7QykmfTX72QNHDGzs8gLOyUkixRMYJd16rZ"
                            width={1100}
                            height={550}
                            alt="VD Capital Currencies Page Preview"
                            priority={true}
                            className="dark:block rounded-[inherit] border object-contain shadow-lg hidden"
                        />
                        <BorderBeam size={450} duration={12} delay={9} />
                    </div>
                </div>
            </div>
        </section>
    )
}
