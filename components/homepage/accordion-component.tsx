import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TITLE_TAILWIND_CLASS } from "@/utils/constants"

export function AccordionComponent() {
    return (
        <div className="flex flex-col w-[70%] lg:w-[50%]">
            <h2 className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold text-center tracking-tight dark:text-white text-gray-900`}>
                Frequently Asked Questions (FAQs)
            </h2>
            <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger><span className="font-medium">When will VD Capital be available for use?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>No bullshit, planning to go live late 2025. Goal is before GTA 6</p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionTrigger><span className="font-medium">Will this make me a better trader?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Probably, dedpends if you are on that grindset mentality. </p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger><span className="font-medium">Pricing?</span></AccordionTrigger>
                    <AccordionContent>
                        <p>Will be the price of a Netflix subscription, you'll get better stuff than whats on Netflix anyway. </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
