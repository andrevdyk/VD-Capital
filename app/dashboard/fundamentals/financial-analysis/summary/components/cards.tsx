import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Import the X icon from Lucide
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DollarCardProps {
  amount: number | string;
  label: string;
  drawerContent?: React.ReactNode; // Pass the content for the drawer
  hasDrawer?: boolean; // Optional prop to enable/disable the drawer
}

export function DollarCard({ amount, label, drawerContent, hasDrawer = true }: DollarCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md text-left min-w-[160px] overflow-hidden" style={{ width: `calc(100vw / 10)` }}>
      <div className="text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold">
        {/* Format as dollar value if it's a number, else display raw string */}
        {typeof amount === "number" ? `$${amount.toFixed(2)}` : amount}
      </div>

      {/* Conditionally render the DrawerTrigger and Drawer if hasDrawer is true */}
      {hasDrawer ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className="mt-2 text-muted-foreground text-left p-1">
              {label}?
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full">
            <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
              <DrawerHeader className="relative">
                <DrawerClose asChild>
                  {/* X Icon positioned top-right */}
                  <X
                    className="absolute top-2 right-2 cursor-pointer"
                    size={24} // Adjust the icon size as necessary
                  />
                </DrawerClose>
                <DrawerTitle>{`Understanding ${label}`}</DrawerTitle>
                <DrawerDescription>
                  More information about {label}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose dark:prose-invert">{drawerContent}</div>
              </div>
              <DrawerFooter>
                {/* You can optionally add footer content here */}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );
}
