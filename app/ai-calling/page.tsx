import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Clock, Zap } from "lucide-react"

export default function AICallingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Calling</h1>
          <p className="text-muted-foreground">Automated AI-powered calling system</p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <p className="text-muted-foreground">
              AI Calling feature is under development. This powerful tool will enable automated calling with AI assistance.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold">Smart Calling</h3>
                <p className="text-sm text-gray-600">AI-powered conversation management</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold">Scheduled Calls</h3>
                <p className="text-sm text-gray-600">Automated follow-up calling</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Phone className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold">Call Analytics</h3>
                <p className="text-sm text-gray-600">Detailed call performance insights</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Expected Features:</strong> Voice AI integration, call scheduling, conversation analytics, 
                lead qualification, and automated follow-ups.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
