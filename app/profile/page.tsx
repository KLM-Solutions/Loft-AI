"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Search,
  BookmarkIcon,
  Star,
  BarChart2,
  LogOut,
  Plus,
  Bell,
  Upload,
  Pencil,
  ChevronRight,
  Settings,
  HelpCircle,
  Smartphone,
  Lock,
  FileText,
  User,
  Eye,
  Grid,
  Globe,
  ListFilter,
  Tag,
  Leaf,
  Share2,
  ExternalLink,
  X,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("account")
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [availableCollections, setAvailableCollections] = useState([
    { id: "ui-mockup", name: "UI mockup", color: "bg-green-500" },
    { id: "inspiration", name: "Inspiration", color: "bg-purple-500" },
    { id: "design", name: "Design", color: "bg-blue-500" },
    { id: "development", name: "Development", color: "bg-yellow-500" },
  ])

  // Toggle states
  const [aiRecommendations, setAiRecommendations] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoSaveBookmarks, setAutoSaveBookmarks] = useState(true)
  const [autoTagging, setAutoTagging] = useState(true)
  const [contentSummarization, setContentSummarization] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [browserExtension, setBrowserExtension] = useState(true)
  const [appearance, setAppearance] = useState(false)

  // Radio button states
  const [summaryLength, setSummaryLength] = useState("standard")
  const [appearanceMode, setAppearanceMode] = useState("light")

  // Slider state
  const [discoveryFrequency, setDiscoveryFrequency] = useState("weekly")

  // Add useEffect to fetch collections on component mount
  useEffect(() => {
    fetch("/api/collections")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAvailableCollections(data.data.map((col: any) => ({
            id: col.id.toString(),
            name: col.name,
            color: col.color
          })));
        }
      })
      .catch(error => {
        console.error('Error fetching collections:', error);
      });
  }, []);

  // Add function to toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  // Add function to close notifications
  const closeNotifications = () => {
    setShowNotifications(false)
  }

  // Handle back button in settings view
  const handleBackToProfile = () => {
    setShowSettings(false)
  }

  // Add this function to generate random colors
  const getRandomColor = () => {
    const colors = [
      "bg-red-500", "bg-pink-500", "bg-purple-500", "bg-indigo-500",
      "bg-blue-500", "bg-cyan-500", "bg-teal-500", "bg-green-500",
      "bg-lime-500", "bg-yellow-500", "bg-orange-500"
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Update handleCreateCollection function
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const color = getRandomColor();
    setIsCreatingCollection(true);
    
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          color: color
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newCollection = {
          id: data.data.id.toString(),
          name: data.data.name,
          color: data.data.color
        };
        
        setAvailableCollections([newCollection, ...availableCollections]);
        setNewCollectionName("");
        setShowNewCollectionModal(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f8fa] overflow-hidden">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6">
            <Link href="/bookmarks" className="flex items-center text-blue-500">
              <img src="/logo.png" alt="Loft AI Logo" className="h-5 w-5" />
              <span className="ml-2 text-lg font-semibold text-slate-800">Loft AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link
              href="/bookmarks"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/bookmarks" ? "text-blue-500 bg-gray-100" : "text-gray-600"}`}
            >
              <Search className={`h-5 w-5 mr-3 ${pathname === "/bookmarks" ? "text-blue-500" : "text-gray-500"}`} />
              <span>Explore</span>
            </Link>
            <Link
              href="/library"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/library" ? "text-blue-500 bg-gray-100" : "text-gray-600"}`}
            >
              <BookmarkIcon className={`h-5 w-5 mr-3 ${pathname === "/library" ? "text-blue-500" : "text-gray-500"}`} />
              <span>Library</span>
            </Link>
            <Link
              href="/run-through"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/run-through" ? "text-blue-500 bg-gray-100" : "text-gray-600"}`}
            >
              <Star className={`h-5 w-5 mr-3 ${pathname === "/run-through" ? "text-blue-500" : "text-gray-500"}`} />
              <span>Run through</span>
            </Link>

            {/* MY COLLECTIONS section */}
            <div className="pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">MY COLLECTIONS</h3>
              <div className="mt-2 space-y-1">
                {availableCollections.slice(0, 3).map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <div className={`w-3 h-3 ${collection.color} rounded-sm mr-3`}></div>
                    <span>{collection.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowNewCollectionModal(true)}
              className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 w-full mt-2"
            >
              <Plus className="h-5 w-5 mr-3 text-gray-500" />
              <span>New Collection</span>
            </button>
          </nav>

          {/* Bottom Links */}
          <div className="px-4 py-4 mt-auto">
            <Link
              href="/bookmarks"
              className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100"
            >
              <BarChart2 className="h-5 w-5 mr-3 text-gray-500" />
              <span>Stats</span>
            </Link>
            <Link
              href="/bookmarks"
              className="flex items-center px-2 py-2 text-sm text-red-500 rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3 text-red-500" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-60 overflow-hidden flex flex-col">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col h-full">
          {showSettings ? (
            // Settings View
            <div className="flex flex-col h-full bg-[#f5f8fa]">
              {/* Header */}
              <header className="flex items-center p-4 bg-[#f5f8fa]">
                <button onClick={handleBackToProfile} className="mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold">Settings</h1>
              </header>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Account Section */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <h2 className="text-lg text-gray-500 font-medium mb-2">Account</h2>

                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <User className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Personal Info</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Bell className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Notification</span>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="toggle-notifications"
                          className="opacity-0 w-0 h-0"
                          checked={notifications}
                          onChange={() => setNotifications(!notifications)}
                        />
                        <label
                          htmlFor="toggle-notifications"
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                            notifications ? "bg-black" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                              notifications ? "transform translate-x-6" : ""
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Preferences Section */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <h2 className="text-lg text-gray-500 font-medium mb-2">App Preferences</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Eye className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Appearance</span>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="toggle-appearance"
                          className="opacity-0 w-0 h-0"
                          checked={appearance}
                          onChange={() => setAppearance(!appearance)}
                        />
                        <label
                          htmlFor="toggle-appearance"
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                            appearance ? "bg-black" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                              appearance ? "transform translate-x-6" : ""
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Grid className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Default View</span>
                      </div>
                      <div className="text-gray-500">Tile</div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Globe className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Language</span>
                      </div>
                      <div className="text-gray-500">English (US)</div>
                    </div>
                  </div>
                </div>

                {/* AI Features Section */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <h2 className="text-lg text-gray-500 font-medium mb-2">AI Features</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <ListFilter className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Summary Length</span>
                      </div>
                      <div className="text-gray-500">Standard</div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Tag className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Tagging Mode</span>
                      </div>
                      <div className="text-gray-500">Auto</div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Leaf className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Discovery Frequency</span>
                      </div>
                      <div className="text-gray-500">Week</div>
                    </div>
                  </div>
                </div>

                {/* Integration Section */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <h2 className="text-lg text-gray-500 font-medium mb-2">Integration</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-4 text-gray-700"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        <span className="text-base font-medium">Browser Extension</span>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="toggle-browser-extension"
                          className="opacity-0 w-0 h-0"
                          checked={browserExtension}
                          onChange={() => setBrowserExtension(!browserExtension)}
                        />
                        <label
                          htmlFor="toggle-browser-extension"
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                            browserExtension ? "bg-black" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                              browserExtension ? "transform translate-x-6" : ""
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Share2 className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Share</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <ExternalLink className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Third-party Services</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Profile View
            <div className="flex flex-col h-full bg-[#f5f8fa]">
              {/* Header */}
              <header className="flex justify-between items-center p-4 bg-[#f5f8fa]">
                <h1 className="text-3xl font-bold">Profile</h1>
                <button className="p-2" onClick={toggleNotifications}>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Notification%20illustration-UNiwIM9674Te4G1EDRpbOY372XDMPA.png"
                    alt="Notifications"
                    className="h-7 w-7 object-contain"
                  />
                </button>
              </header>

              {/* Profile Content */}
              <div className="flex-1 overflow-y-auto px-4">
                {/* Profile Info */}
                <div className="flex items-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile_Account-SIHXlzvO7XPnKlUjd1CVboYQ9WcXUE.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">Design Picko</h2>
                    <p className="text-gray-500">hello@designpicko.com</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-2xl font-bold">128</span>
                    <span className="text-gray-500 text-sm">Total Saved</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-2xl font-bold">14</span>
                    <span className="text-gray-500 text-sm">Collections</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-2xl font-bold">43</span>
                    <span className="text-gray-500 text-sm">Days Active</span>
                  </div>
                </div>

                {/* General Section */}
                <div className="mb-6">
                  <h3 className="text-lg text-gray-500 font-medium mb-2">General</h3>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <User className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Edit Profile</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      className="w-full flex items-center justify-between p-4 border-b border-gray-100"
                      onClick={() => setShowSettings(true)}
                    >
                      <div className="flex items-center">
                        <Settings className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Settings</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <HelpCircle className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Help & Support</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* App Info Section */}
                <div className="mb-6">
                  <h3 className="text-lg text-gray-500 font-medium mb-2">App Info</h3>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <Smartphone className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">App Version</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <Lock className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Privacy Policy</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 mr-4 text-gray-700" />
                        <span className="text-base font-medium">Terms of services</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <button className="w-full flex items-center p-4 text-red-500 font-medium mb-20">
                  <LogOut className="w-6 h-6 mr-4" />
                  <span className="text-base">Logout</span>
                </button>
              </div>

              {/* Mobile Bottom Navigation */}
              <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
                <Link href="/bookmarks" className="flex flex-col items-center text-gray-500">
                  <Search className="h-6 w-6" />
                  <span className="text-xs mt-1">Explore</span>
                </Link>
                <Link href="/library" className="flex flex-col items-center text-gray-500">
                  <BookmarkIcon className="h-6 w-6" />
                  <span className="text-xs mt-1">Library</span>
                </Link>
                <Link href="/run-through" className="flex flex-col items-center text-gray-500">
                  <Star className="h-6 w-6" />
                  <span className="text-xs mt-1">Run through</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center text-blue-500">
                  <Settings className="h-6 w-6" />
                  <span className="text-xs mt-1">Settings</span>
                </Link>
              </nav>
            </div>
          )}
          {/* Mobile Notification View */}
          {showNotifications && (
            <div className="fixed inset-0 bg-[#f5f8fa] z-50 flex flex-col">
              {/* Header */}
              <header className="flex items-center p-4">
                <button onClick={closeNotifications} className="mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold">Notification</h1>
              </header>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-48 h-48 mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Notification%20illustration-UNiwIM9674Te4G1EDRpbOY372XDMPA.png"
                    alt="No notifications"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-center mb-3">No Notifications Yet</h2>
                <p className="text-gray-500 text-center text-base">
                  When you get notifications,
                  <br />
                  they'll show up here
                </p>
                <p className="text-gray-400 text-center text-sm mt-4 max-w-xs">
                  Stay updated with the latest activity, mentions, and important alerts
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          {/* Header */}
          <header className="flex items-center justify-between p-4 bg-[#f5f8fa]">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleNotifications}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Notification%20illustration-UNiwIM9674Te4G1EDRpbOY372XDMPA.png"
                  alt="Notifications"
                  className="h-6 w-6 object-contain"
                />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile_AI%20Preferences-lOOyeUo2QT80sVstI1p6RGbXfVjNxM.png"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-[#f5f8fa]">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab("account")}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === "account"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === "settings"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab("ai-preference")}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === "ai-preference"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                AI Preference
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === "integrations"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === "about"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                About
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-[#f5f8fa] overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 mr-6">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile_Account-SIHXlzvO7XPnKlUjd1CVboYQ9WcXUE.png"
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Design Picko</h2>
                      <p className="text-gray-500">hello@designpicko.com</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-sm font-medium">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Personal information</h3>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-sm font-medium">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium">Lois Becket</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">Loisbecket@gmail.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Account type</p>
                      <p className="font-medium">Free</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">User ID</p>
                      <p className="font-medium">4048583</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-2">
                        <BookmarkIcon className="h-6 w-6 text-gray-700" />
                      </div>
                      <p className="text-2xl font-bold">128</p>
                      <p className="text-sm text-gray-500">Total Saved</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-2">
                        <svg
                          className="h-6 w-6 text-gray-700"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold">14</p>
                      <p className="text-sm text-gray-500">Collections</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-2">
                        <svg
                          className="h-6 w-6 text-gray-700"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold">43</p>
                      <p className="text-sm text-gray-500">Days Active</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6">App Preferences</h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Enable Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notification for important updates</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="toggle-notifications"
                        className="opacity-0 w-0 h-0"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                      />
                      <label
                        htmlFor="toggle-notifications"
                        className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                          notifications ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                            notifications ? "transform translate-x-6" : ""
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Appearance</h3>
                    <p className="text-sm text-gray-500 mb-4">Choose your preferred mode</p>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="appearance"
                          value="light"
                          checked={appearanceMode === "light"}
                          onChange={() => setAppearanceMode("light")}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            appearanceMode === "light" ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          {appearanceMode === "light" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="ml-2">Light</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="appearance"
                          value="dark"
                          checked={appearanceMode === "dark"}
                          onChange={() => setAppearanceMode("dark")}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            appearanceMode === "dark" ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          {appearanceMode === "dark" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="ml-2">Dark</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="appearance"
                          value="system"
                          checked={appearanceMode === "system"}
                          onChange={() => setAppearanceMode("system")}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            appearanceMode === "system" ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          {appearanceMode === "system" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="ml-2">System</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Default View</h3>
                      <p className="text-sm text-gray-500">Choose your default view when opening the app</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">Cards</span>
                      <svg
                        className="h-5 w-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Default View</h3>
                      <p className="text-sm text-gray-500">Choose your default view when opening the app</p>
                    </div>
                    <div>
                      <span>English US</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold mb-6">Behaviour</h2>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Auto-save Bookmarks</h3>
                          <p className="text-sm text-gray-500">Automatically save bookmarks when you visit them</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                          <input
                            type="checkbox"
                            id="toggle-auto-save"
                            className="opacity-0 w-0 h-0"
                            checked={autoSaveBookmarks}
                            onChange={() => setAutoSaveBookmarks(!autoSaveBookmarks)}
                          />
                          <label
                            htmlFor="toggle-auto-save"
                            className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                              autoSaveBookmarks ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                autoSaveBookmarks ? "transform translate-x-6" : ""
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Display Density</h3>
                          <p className="text-sm text-gray-500">Adjust the density of the UI</p>
                        </div>
                        <div>
                          <span>Comfortable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Preference Tab */}
            {activeTab === "ai-preference" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Enable AI Recommendations</h3>
                      <p className="text-sm text-gray-500">Get personalised bookmark suggestions</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="toggle-ai-recommendations"
                        className="opacity-0 w-0 h-0"
                        checked={aiRecommendations}
                        onChange={() => setAiRecommendations(!aiRecommendations)}
                      />
                      <label
                        htmlFor="toggle-ai-recommendations"
                        className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                          aiRecommendations ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                            aiRecommendations ? "transform translate-x-6" : ""
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Summary Length</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose how detailed you want your bookmark summaries to be
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <label
                        className={`p-4 rounded-lg border ${
                          summaryLength === "brief" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="summaryLength"
                          value="brief"
                          checked={summaryLength === "brief"}
                          onChange={() => setSummaryLength("brief")}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Brief</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              summaryLength === "brief" ? "border-blue-500" : "border-gray-300"
                            }`}
                          >
                            {summaryLength === "brief" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">1 sentence</p>
                      </label>
                      <label
                        className={`p-4 rounded-lg border ${
                          summaryLength === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="summaryLength"
                          value="standard"
                          checked={summaryLength === "standard"}
                          onChange={() => setSummaryLength("standard")}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Standard</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              summaryLength === "standard" ? "border-blue-500" : "border-gray-300"
                            }`}
                          >
                            {summaryLength === "standard" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">2-3 sentences</p>
                      </label>
                      <label
                        className={`p-4 rounded-lg border ${
                          summaryLength === "detailed" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="summaryLength"
                          value="detailed"
                          checked={summaryLength === "detailed"}
                          onChange={() => setSummaryLength("detailed")}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Detailed</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              summaryLength === "detailed" ? "border-blue-500" : "border-gray-300"
                            }`}
                          >
                            {summaryLength === "detailed" && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">Paragraph</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Discovery Frequency</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      How often would you like to receive content recommendations
                    </p>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={discoveryFrequency === "daily" ? 0 : discoveryFrequency === "weekly" ? 1 : 2}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value)
                          setDiscoveryFrequency(val === 0 ? "daily" : val === 1 ? "weekly" : "monthly")
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500">Daily</span>
                        <span className="text-sm text-gray-500">Weekly</span>
                        <span className="text-sm text-gray-500">Monthly</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold mb-6">Content Analysis</h2>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Auto-tagging</h3>
                          <p className="text-sm text-gray-500">Automatically tag bookmarks based on content</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                          <input
                            type="checkbox"
                            id="toggle-auto-tagging"
                            className="opacity-0 w-0 h-0"
                            checked={autoTagging}
                            onChange={() => setAutoTagging(!autoTagging)}
                          />
                          <label
                            htmlFor="toggle-auto-tagging"
                            className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                              autoTagging ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                autoTagging ? "transform translate-x-6" : ""
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Content Summarisation</h3>
                          <p className="text-sm text-gray-500">Generate summaries for your bookmarks</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                          <input
                            type="checkbox"
                            id="toggle-content-summarization"
                            className="opacity-0 w-0 h-0"
                            checked={contentSummarization}
                            onChange={() => setContentSummarization(!contentSummarization)}
                          />
                          <label
                            htmlFor="toggle-content-summarization"
                            className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                              contentSummarization ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                contentSummarization ? "transform translate-x-6" : ""
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium">Relevance threshold</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6">Connected Services</h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Chrome Extension</h3>
                      <p className="text-sm text-gray-500">Save bookmarks directly from your browser</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium">
                      Disconnect
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Twitter</h3>
                      <p className="text-sm text-gray-500">Save tweets and threads automatically</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Connect</button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Youtube</h3>
                      <p className="text-sm text-gray-500">Save favourite youtube videos</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Connect</button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Google</h3>
                      <p className="text-sm text-gray-500">Send new bookmarks to google sheets</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Connect</button>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold mb-6">Sync Settings</h2>

                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Auto-sync</h3>
                        <p className="text-sm text-gray-500">Automatically sync bookmarks across devices</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="toggle-auto-sync"
                          className="opacity-0 w-0 h-0"
                          checked={autoSync}
                          onChange={() => setAutoSync(!autoSync)}
                        />
                        <label
                          htmlFor="toggle-auto-sync"
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                            autoSync ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                              autoSync ? "transform translate-x-6" : ""
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Version</h3>
                      <p className="text-sm text-gray-500">Save bookmarks directly from your browser</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Privacy Policy</h3>
                      <p className="text-sm text-gray-500">Save tweets and threads automatically</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Third-Party Services</h3>
                      <p className="text-sm text-gray-500">Save favourite youtube videos</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Help and Support</h3>
                      <p className="text-sm text-gray-500">Send new bookmarks to google sheets</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Overlay for desktop */}
      {showNotifications && (
        <div className="hidden md:block fixed inset-0 bg-black bg-opacity-25 z-40" onClick={closeNotifications}></div>
      )}
      {/* Desktop Notification Panel */}
      {showNotifications && (
        <div className="hidden md:block fixed inset-y-0 right-0 w-[550px] bg-white shadow-lg z-50">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <button onClick={closeNotifications} className="text-gray-500 hover:text-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-48 h-48 mb-8">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Notification%20illustration-UNiwIM9674Te4G1EDRpbOY372XDMPA.png"
                  alt="No notifications"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-center mb-3">No Notifications Yet</h2>
              <p className="text-gray-500 text-center text-base">
                When you get notifications,
                <br />
                they'll show up here
              </p>
              <p className="text-gray-400 text-center text-sm mt-4 max-w-xs">
                Stay updated with the latest activity, mentions, and important alerts
              </p>
            </div>

            <div className="p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
              <span>Powered by Loft</span>
              <div className="flex space-x-4">
                <span>Privacy</span>
                <span>Report</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Collection</h2>
                <button
                  onClick={() => setShowNewCollectionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isCreatingCollection}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  id="collectionName"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreatingCollection}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewCollectionModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
                  disabled={isCreatingCollection}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  className={`px-4 py-2 rounded-xl flex items-center justify-center min-w-[80px] ${
                    !newCollectionName.trim() || isCreatingCollection
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  disabled={!newCollectionName.trim() || isCreatingCollection}
                >
                  {isCreatingCollection ? (
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
