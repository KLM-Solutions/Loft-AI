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
  Mail,
} from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [activeTab, setActiveTab] = useState("account")
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [statistics, setStatistics] = useState<{bookmarks: number, tags: number, collections: number}>({
    bookmarks: 0,
    tags: 0,
    collections: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

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

  // Add function to fetch statistics
  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      // Fetch all content from /api/all
      const allResponse = await fetch('/api/all');
      if (!allResponse.ok) throw new Error('Failed to fetch all content');
      const allData = await allResponse.json();
      
      if (allData.success) {
        const allContent = allData.data || [];
        
        // Calculate bookmarks count (all content items)
        const bookmarksCount = allContent.length;
        
        // Calculate unique tags count
        const allTags = new Set<string>();
        allContent.forEach((item: any) => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => allTags.add(tag));
          }
        });
        const tagsCount = allTags.size;
        
        // Calculate unique collections count
        const allCollections = new Set<string>();
        allContent.forEach((item: any) => {
          if (item.collections && Array.isArray(item.collections)) {
            item.collections.forEach((collection: string) => allCollections.add(collection));
          }
        });
        const collectionsCount = allCollections.size;
        
        // Update statistics state
        setStatistics({
          bookmarks: bookmarksCount,
          tags: tagsCount,
          collections: collectionsCount
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Add useEffect to fetch collections and statistics on component mount
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

    fetchStatistics();
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

  // Add function to handle sign out
  const handleSignOut = () => {
    signOut(() => {
      router.push('/');
    });
  };

  return (
    <div className="flex h-screen bg-[#f5f8fa] overflow-hidden">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo - Removed InShort text */}
          <div className="px-6 py-6">
            <Link href="/bookmarks" className="flex items-center text-red-500">
              <img src="/logo.svg" alt="Loft AI Logo" className="h-5 w-5" />
              <span className="ml-2 text-lg font-semibold text-slate-800">Loft AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link
              href="/bookmarks"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/bookmarks" ? "text-red-500 bg-gray-100" : "text-gray-900"}`}
            >
              <Search className={`h-5 w-5 mr-3 ${pathname === "/bookmarks" ? "text-red-500" : "text-gray-500"}`} />
              <span>Explore</span>
            </Link>
            <Link
              href="/library"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/library" ? "text-red-500 bg-gray-100" : "text-gray-600"}`}
            >
              <BookmarkIcon className={`h-5 w-5 mr-3 ${pathname === "/library" ? "text-red-500" : "text-gray-500"}`} />
              <span>Library</span>
            </Link>
            <Link
              href="/run-through"
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/run-through" ? "text-red-500 bg-gray-100" : "text-gray-600"}`}
            >
              <Star className={`h-5 w-5 mr-3 ${pathname === "/run-through" ? "text-red-500" : "text-gray-500"}`} />
              <span>Run through</span>
            </Link>

            {/* MY COLLECTIONS moved here as a regular nav item */}
            <div className="pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">MY COLLECTIONS</h3>
              <div className="mt-2 space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto [overflow-y:scroll] [-webkit-overflow-scrolling:touch]">
                {availableCollections.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-gray-500">No collections yet</div>
                ) : (
                  availableCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <div className={`w-3 h-3 ${collection.color} rounded-sm mr-3`}></div>
                    <span>{collection.name}</span>
                  </div>
                  ))
                )}
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
            <div className="flex items-center px-2 py-2 text-sm text-gray-400 rounded-full cursor-not-allowed">
              <BarChart2 className="h-5 w-5 mr-3 text-gray-400" />
              <span>Stats</span>
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
            </div>
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
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 mr-6 overflow-hidden">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.firstName || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-600 mx-auto mt-5" />
                      )}
                  </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
                    <BookmarkIcon className="w-6 h-6 mb-2 text-gray-700" />
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-2"></div>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">{statistics.bookmarks}</span>
                    )}
                    <span className="text-gray-500 text-sm">Bookmarks</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
                    <Tag className="w-6 h-6 mb-2 text-gray-700" />
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-2"></div>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">{statistics.tags}</span>
                    )}
                    <span className="text-gray-500 text-sm">Tags</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {isLoadingStats ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-2"></div>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">{statistics.collections}</span>
                    )}
                    <span className="text-gray-500 text-sm">Collections</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="mt-8">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center p-4 text-red-500 font-medium bg-white rounded-2xl shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-base">Sign Out</span>
                  </button>
                </div>
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
                <div className="flex flex-col items-center text-red-500">
                  <Settings className="h-6 w-6" />
                  <span className="text-xs mt-1">Settings</span>
                </div>
              </nav>
            </div>
          )}
          {/* Mobile Notification View */}
          {showNotifications && (
            <div className="fixed inset-0 bg-[#f5f8fa] z-50 flex flex-col">
              {/* Header */}
              <header className="flex items-center justify-between p-4">
                <div className="flex items-center">
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
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
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
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {user?.imageUrl ? (
                <img
                    src={user.imageUrl}
                    alt={user.firstName || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
                ) : (
                  <User className="h-6 w-6 text-gray-600" />
                )}
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
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Account
              </button>
              {/* TEMPORARILY HIDDEN - WILL BE ADDED BACK LATER */}
              {/* 
              <button
                onClick={() => setActiveTab("settings")}
                disabled
                className="py-4 px-1 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center"
              >
                Settings
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
              </button>
              <button
                onClick={() => setActiveTab("ai-preference")}
                disabled
                className="py-4 px-1 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center"
              >
                AI Preference
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                disabled
                className="py-4 px-1 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center"
              >
                Integrations
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
              </button>
              <button
                onClick={() => setActiveTab("about")}
                disabled
                className="py-4 px-1 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center"
              >
                About
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
              </button>
              */}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-[#f5f8fa] overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 mr-6 overflow-hidden">
                      {user?.imageUrl ? (
                      <img
                          src={user.imageUrl}
                          alt={user.firstName || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                      ) : (
                        <User className="w-10 h-10 text-gray-600 mx-auto mt-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Personal information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Username</p>
                      <p className="font-medium">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">First Name</p>
                      <p className="font-medium">{user?.firstName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Name</p>
                      <p className="font-medium">{user?.lastName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="flex justify-center mb-2">
                        <BookmarkIcon className="h-6 w-6 text-gray-700" />
                      </div>
                      {isLoadingStats ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-300 rounded mb-2"></div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold">{statistics.bookmarks}</p>
                      )}
                      <p className="text-sm text-gray-500">Bookmarks</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className="flex justify-center mb-2">
                        <Tag className="h-6 w-6 text-gray-700" />
                      </div>
                      {isLoadingStats ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-300 rounded mb-2"></div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold">{statistics.tags}</p>
                      )}
                      <p className="text-sm text-gray-500">Tags</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
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
                      {isLoadingStats ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    </div>
                      ) : (
                        <p className="text-2xl font-bold">{statistics.collections}</p>
                      )}
                      <p className="text-sm text-gray-500">Collections</p>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="mt-8">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center p-4 text-red-500 font-medium bg-white rounded-2xl shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-base">Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Coming Soon Message for Other Tabs */}
            {activeTab !== "account" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-32 h-32 mb-6">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Favorite%20illustration-l25o0Haqveq5uoh66hFNScJ6uLYb4m.png"
                      alt="Coming Soon"
                      className="w-full h-full object-contain"
                    />
                    </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                  <p className="text-gray-600 mb-8 max-w-md">
                    This feature is currently under development. We're working hard to bring you the best experience.
                  </p>
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
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">Coming Soon</span>
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
