"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Search, Sparkles, ArrowRight, Instagram, Youtube, Twitter } from "lucide-react"
import Image from "next/image"
import { SignInButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const handleStart = () => {
    if (isSignedIn) {
      router.push("/bookmarks");
    } else {
      const signInBtn = document.getElementById("clerk-signin-btn");
      if (signInBtn) signInBtn.click();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Loft AI Logo" width={20} height={20} className="rounded-lg" />
            <span className="text-xl font-semibold text-slate-800">Loft AI</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Enhanced Bookmarking
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Save everything.
                <br />
                <span className="text-blue-600">Remember anything.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Loft uses AI to automatically summarize, tag, and resurface your saved links, social posts, and ideas
                exactly when you need them most.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStart}>
                  Start Saving for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {/* Hidden SignInButton for modal trigger */}
                <SignInButton mode="modal" forceRedirectUrl="/bookmarks">
                  <button id="clerk-signin-btn" style={{ display: 'none' }} />
                </SignInButton>
              </>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center sm:text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">AI Search</h3>
                <p className="text-sm text-slate-600">Ask questions in natural language</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Smart Summaries</h3>
                <p className="text-sm text-slate-600">Auto-generated insights and tags</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Daily Cards</h3>
                <p className="text-sm text-slate-600">Rediscover past saves intelligently</p>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Cards */}
          <div className="space-y-4 lg:space-y-6">
            {/* Instagram Card */}
            <Card className="p-4 bg-white shadow-sm border-0 shadow-blue-100/50">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Saved 2 hours ago</p>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    You paused that reel about <span className="font-medium">'healthy meal prep hacks'</span> want to
                    finish it or get a quick summary of the tips?
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      #cooking
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      #health
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* YouTube Card */}
            <Card className="p-4 bg-white shadow-sm border-0 shadow-blue-100/50">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Youtube className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Saved 1 day ago</p>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    Hey! You watched half of <span className="font-medium">'How to Build a Morning Routine'</span> want
                    to finish it today? Here's your quick summary so far.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      #productivity
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      #habits
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Insight Card */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 mb-1">AI Insight</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Based on your recent saves, you might also like these 3 productivity articles from last month.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 lg:mt-24 text-center">
          <p className="text-sm text-slate-500 mb-6">Save from anywhere</p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <Instagram className="w-6 h-6 text-slate-400" />
            <Youtube className="w-6 h-6 text-slate-400" />
            <Twitter className="w-6 h-6 text-slate-400" />
            <div className="text-slate-400 font-medium">Chrome</div>
            <div className="text-slate-400 font-medium">Safari</div>
          </div>
        </div>
      </main>
    </div>
  )
}
