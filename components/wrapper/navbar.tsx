"use client"
import Link from 'next/link';
import * as React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import ModeToggle from "../mode-toggle";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import Image from 'next/image'

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Marketing Page",
        href: "/marketing-page",
        description: "Write some wavy here to get them to click.",
    },
    {
        title: "Marketing Page",
        href: "/marketing-page",
        description: "Write some wavy here to get them to click.",
    },
    {
        title: "Marketing Page",
        href: "/marketing-page",
        description: "Write some wavy here to get them to click.",
    },
];

export default function NavBar() {
    

    return (
        <div className="flex min-w-full fixed justify-between p-2 border-b z-10 dark:bg-black dark:bg-opacity-50 bg-white">
            <div className="flex justify-between w-full min-[825px]:hidden">
                <Dialog>
                    <SheetTrigger className="p-2 transition">
                        <Button size="icon" variant="ghost" className="w-4 h-4" aria-label="Open menu" asChild>
                            <GiHamburgerMenu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Next Starter</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col space-y-3 mt-[1rem]">
                            <DialogClose asChild>
                                <Link href="/">
                                    <Button variant="outline" className="w-full">Home</Button>
                                </Link>
                            </DialogClose>
                            <DialogClose asChild>
                                <Link href="/dashboard" legacyBehavior passHref className="cursor-pointer">
                                    <Button variant="outline">
                                        Trading Terminal
                                    </Button>
                                </Link>
                            </DialogClose>
                            <DialogClose asChild>
                                <Link href="/education" legacyBehavior passHref className="cursor-pointer">
                                    <Button variant="outline">
                                        University
                                    </Button>
                                </Link>
                            </DialogClose>
                        </div>
                    </SheetContent>
                </Dialog>
                <ModeToggle />
            </div>
            <NavigationMenu>
                <NavigationMenuList className="max-[825px]:hidden flex gap-3 w-[100%] justify-between">
                <Link className="flex items-center gap-1 font-semibold ml-1" href="/">
            {/* Light Mode Image */}
            <Image 
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(2).png?raw=true"
              alt="VD Capital Light Mode"
              width={30}
              height={30}
              className="dark:hidden block ml-3" // Show in light mode, hide in dark mode
            />
            {/* Dark Mode Image */}
            <Image
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(3).png?raw=true"
              alt="VD Capital Dark Mode"
              width={30}
              height={30}
              className="hidden dark:block ml-3" // Show in dark mode, hide in light mode
            />
          </Link>
                <Link className="flex items-center gap-1 font-semibold ml-1" href="/">
            {/* Light Mode Image */}
            <Image 
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201.png?raw=true"
              alt="VD Capital Light Mode"
              width={100}
              height={40}
              className="dark:hidden block mt-1" // Show in light mode, hide in dark mode
            />
            {/* Dark Mode Image */}
            <Image
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(1).png?raw=true"
              alt="VD Capital Dark Mode"
              width={100}
              height={40}
              className="hidden dark:block mt-1 ml--1" // Show in dark mode, hide in light mode
            />
          </Link>
                </NavigationMenuList>
                <NavigationMenuList>
                    <NavigationMenuItem className="max-[825px]:hidden ml-5">
                        <NavigationMenuTrigger className="dark:bg-black dark:bg-opacity-50">
                            Features
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="flex flex-col w-[400px] gap-3 p-4 lg:w-[500px]">
                                {components.map((component) => (
                                    <ListItem
                                        key={component.title}
                                        title={component.title}
                                        href={component.href}
                                    >
                                        {component.description}
                                    </ListItem>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="max-[825px]:hidden">
                        <Link href="/dashboard" legacyBehavior passHref>
                            <Button variant="ghost">
                                Trading Terminal
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="max-[825px]:hidden">
                        <Link href="/dashboard" legacyBehavior passHref>
                            <Button variant="ghost">
                                University
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center gap-2 max-[825px]:hidden">
                <ModeToggle />
            </div>
        </div>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
