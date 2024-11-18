import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function TabsNavbar() {
    return(
        <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Currencies">Curencies</TabsTrigger>
            <TabsTrigger value="Stocks">Stocks</TabsTrigger>
            <TabsTrigger value="Commodities">Commodities</TabsTrigger>
            <TabsTrigger value="Indices">Indices</TabsTrigger>
            <TabsTrigger value="Crypto">Crypto</TabsTrigger>
        </TabsList>
        </Tabs>

    )
}