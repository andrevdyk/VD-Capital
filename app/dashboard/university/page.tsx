import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlossarySection } from "./components/glossary-section"
import { LearningPathSection } from "./components/learning-path-section"
import { RoadmapSection } from "./components/roadmap-section"
import { LeaderboardSection } from "./components/leaderboard-section"
import { VDCapitalTestSection } from "./components/vd-capital-test-section"
import { HistoricalEventsSection } from "./components/historical-events-section"
import { PersonalFinanceSection } from "./components/personal-finance-section"
import { AlternativeInvestmentsSection } from "./components/alternative-investments-section"
import { CertificatesSection } from "./components/certificates-section"
import { ProgressTrackingSection } from "./components/progress-tracking-section"

export default function UniversityPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Trading University</h1>
        <p className="text-muted-foreground text-lg">
          Master the art and science of trading, investing, and personal finance with our comprehensive learning
          resources
        </p>
      </div>

      <Tabs defaultValue="learning-path" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8 overflow-auto">
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
          <TabsTrigger value="glossary">Financial Glossary</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="learning-path" className="mt-0">
          <LearningPathSection />
        </TabsContent>

        <TabsContent value="progress" className="mt-0">
          <ProgressTrackingSection />
        </TabsContent>

        <TabsContent value="certificates" className="mt-0">
          <CertificatesSection />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-0">
          <RoadmapSection />
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <GlossarySection />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <LeaderboardSection />
        </TabsContent>
      </Tabs>

      <div className="mt-12 space-y-12">
        <section id="vd-capital-test">
          <h2 className="text-3xl font-bold mb-6">VD Capital Trading Challenge</h2>
          <VDCapitalTestSection />
        </section>

        <section id="historical-events">
          <h2 className="text-3xl font-bold mb-6">Historical Financial Events</h2>
          <HistoricalEventsSection />
        </section>

        <section id="personal-finance">
          <h2 className="text-3xl font-bold mb-6">Personal Finance Guidance</h2>
          <PersonalFinanceSection />
        </section>

        <section id="alternative-investments">
          <h2 className="text-3xl font-bold mb-6">Alternative Investment Options</h2>
          <AlternativeInvestmentsSection />
        </section>
      </div>
    </div>
  )
}

