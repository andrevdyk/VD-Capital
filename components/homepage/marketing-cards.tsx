"use client";
import { TITLE_TAILWIND_CLASS } from "@/utils/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const ProjectsData = [
  {
    id: 1,
    name: "Technicals",
    description:
      "Dive deep into market trends with powerful tools that help you predict price movements using charts, patterns and technical indicators.",
    image: "https://utfs.io/f/a8df6965-e6df-417a-ab0b-b3ad33d701d7-hcfblw.png",
    imageDark:
      "https://utfs.io/f/c5588304-c7ff-43f9-b164-3b9c78474b73-rv0oux.png",
    url: "https://nextjs.org/",
  },
  {
    id: 2,
    name: "Fundamentals",
    description:
      "Uncover the real valye of assets by analyzing macroeconomic events, earnings reports, and financial statements giving you isnights to make informed decisions.",
    image: "https://utfs.io/f/5b51351d-218b-4931-a296-0a9275030aaf-8myeez.png",
    url: "https://www.typescriptlang.org/",
  },
  {
    id: 3,
    name: "Algorithms",
    description:
      "Automate your trading strategies with cutting edge algos that execute trades based on sophisticated market patterns and your custom parameters.",
    image: "https://utfs.io/f/666774c0-dc3a-4d5a-84b7-cc96e682db61-bhgw4o.png",
    url: "https://tailwindui.com/",
  },
  {
    id: 4,
    name: "Artificial Intelligence",
    description: "Harness AI to gain predictive insights, optimize your trades, and stay aheadf of market changes with smart, data-driven decisions.",
    image: "https://utfs.io/f/bc4c7cdb-dc42-452c-8744-0ad2c3232e7f-exyul9.png",
    imageDark:
      "https://github.com/andrevdyk/Photos/blob/main/BrainCircuit.jpg?raw=true",
    url: "/",
  },
  {
    id: 5,
    name: "Trade Journal",
    description:
      "Plan, execute and reflect on your trades with our comprehensive journal, helping you track performance and refine strategies for future success.",
    image: "https://utfs.io/f/aee7360d-54f1-4ed1-a4b4-49a56b455bf4-1ker11.png",
    url: "https://clerk.com/",
  },
  {
    id: 6,
    name: "Financial Analysis",
    description:
      "Get a complete picture of a companies financial health and the broader economy by using our financial models to make better investment choices and forecast growth trends",
    image: "https://utfs.io/f/c62a5d13-91e4-476f-9d36-786d9995c97f-rqpuxo.png",
    url: "https://supabase.com/",
  },
  {
    id: 7,
    name: "Weather Factors",
    description:
      "Track critical weather data that affects crop production, giving you an edge in commodity trading by staying informed about potential supply changes.",
    image: "https://utfs.io/f/c3933696-cd5c-4de7-a24e-1822df8c4215-g7gclc.png",
    url: "https://prisma.io/",
  },
  {
    id: 8,
    name: "Shipping Insights",
    description:
      "Monitor global shipping routes to keep an eye on vessel movements and commodity shipments, ensuring you are always up to date with logistical information.",
    image: "https://utfs.io/f/a2fbe9db-35f8-4738-a4c4-0b9a29f4efc7-er2coj.png",
    url: "https://stripe.com",
  },
  {
    id: 9,
    name: "Mining Resources",
    description: "Gain insights into the production rates and efficiency of mining operations to better predict supply levels and potential market impacts for various commoditites.",
    image: "https://utfs.io/f/ee162388-f998-4740-bfc4-9d9a7050f485-90gb5l.png",
    url: "https://tanstack.com/query/v5",
  },
  {
    id: 10,
    name: "Real-Time News Feed",
    description: "Stay on top of market-moving headlines with real-time news, curated from top financial sources, giving you the edge to act quickly on breaking developments.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 11,
    name: "University",
    description: "Master real trading through technical, fundamental, contextual, political and financial analysis, earning certificates as you progress through the program.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 12,
    name: "Insider Trading",
    description: "Get notified of insider trading activities from corporate executives and large stakeholders, offering insight into market shifts.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 13,
    name: "Portfolio Manager",
    description: "Track and manage your investments in real time with performance metrics, risk assesments and rebalancing tools to optimize your portfolio.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 14,
    name: "Risk Management Tools",
    description: "Gain access to sophisticated risk analysis and position sizing tools to manage exposure and protect your capital.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 15,
    name: "Backtesting",
    description:
      "Test your trading strategies to give you confidence in the real markets.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
  {
    id: 16,
    name: "Community",
    description: "Connect with other traders, share strategies, designed to foster a collaborative learning and social environment.",
    image: "https://utfs.io/f/c01790c1-7c12-4a5e-b50f-a44358124853-3mzznq.png",
    url: "https://upstash.com/",
  },
];

const SpringAnimatedFeatures = () => {
  return (
    <div className="flex flex-col justify-center items-center lg:w-[75%]">
      <div className="flex flex-col mb-[3rem]">
        <h2
          className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold tracking-tight dark:text-white text-gray-900`}
        >
          Trading Toolkit for Success.
        </h2>
        <p className="mx-auto max-w-[500px] text-gray-600 dark:text-gray-400 text-center mt-2 ">
          Your customers deserve a product built with the best technologies in
          our Nextjs Starter Kit
        </p>
      </div>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ProjectsData.map((project) => {
          return (
            <motion.div
              whileHover={{
                y: -8,
              }}
              transition={{
                type: "spring",
                bounce: 0.7,
              }}
              key={project.id}
              className="mt-5 text-left border p-6 rounded-md dark:bg-black"
            >
              <Link
                href={project?.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={project?.imageDark ? project?.imageDark : project.image}
                  width={40}
                  height={30}
                  className="mb-3 rounded"
                  alt={project.name}
                />
                <div className="mb-1 text-sm font-medium ">{project.name}</div>
                <div className="max-w-[250px] text-sm font-normal text-gray-600 dark:text-gray-400">
                  {project.description}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SpringAnimatedFeatures;
