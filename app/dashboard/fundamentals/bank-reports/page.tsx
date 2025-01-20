import ReportList from './components/ReportList'
import ReportDetail from './components/ReportDetail'

export default function Home() {
  return (
    <div className="container mx-4 p-2">
      <h1 className="text-2xl font-bold mb-4">Investment Report Viewer</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <ReportList />
        </div>
        <div className="w-full md:w-2/3">
          <ReportDetail />
        </div>
      </div>
    </div>
  )
}

