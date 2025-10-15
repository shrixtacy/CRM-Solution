import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, BarChart3, TrendingUp, Users } from "lucide-react"

export default function AICallReportPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Call Report</h1>
          <p className="text-muted-foreground">Comprehensive analytics for AI calling performance</p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <PhoneCall className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <p className="text-muted-foreground">
              AI Call Report feature is under development. Get detailed insights into your AI calling performance.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold">Call Analytics</h3>
                <p className="text-sm text-gray-600">Detailed performance metrics</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold">Success Rates</h3>
                <p className="text-sm text-gray-600">Conversion and engagement tracking</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold">Lead Insights</h3>
                <p className="text-sm text-gray-600">Customer interaction analysis</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Expected Features:</strong> Call duration analytics, success rate tracking, 
                conversation sentiment analysis, lead qualification reports, and performance dashboards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
