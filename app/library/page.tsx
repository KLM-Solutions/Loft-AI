"use client"

import Link from "next/link"
import { Search, BookmarkIcon, BarChart2, LogOut, Plus, Star, Settings, X, ExternalLink } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { UserButton, SignedIn } from "@clerk/nextjs"
import ReactMarkdown from 'react-markdown'

export default function LibraryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [bookmarks, setBookmarks] = useState([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [cardView, setCardView] = useState<"list" | "grid">("list");
  const [expandedGridIds, setExpandedGridIds] = useState<Set<string | number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [availableCollections, setAvailableCollections] = useState([
    { id: "ui-mockup", name: "UI mockup", color: "bg-green-500" },
    { id: "inspiration", name: "Inspiration", color: "bg-purple-500" },
    { id: "design", name: "Design", color: "bg-blue-500" },
    { id: "development", name: "Development", color: "bg-yellow-500" },
  ])
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/library")
      .then(res => res.json())
      .then(data => {
        setBookmarks(data.data || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching bookmarks:', error);
        setIsLoading(false);
      });
  }, []);

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
          {/* Logo - Removed InShort text */}
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
              <div className="mt-2 space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
                {availableCollections.map((collection) => (
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
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-semibold">Library</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleNotifications}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Notification%20illustration-UNiwIM9674Te4G1EDRpbOY372XDMPA.png"
                alt="Notifications"
                className="h-6 w-6 object-contain"
              />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 overflow-hidden">
              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* Mobile Header - Hidden on Desktop */}
        <header className="md:hidden p-4 bg-[#f5f8fa] border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-semibold">Library</h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-[#f5f8fa]">
          {/* Fixed Header Section */}
          <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#f5f8fa] z-10 pb-4">
              <h1 className="text-2xl font-bold">All Bookmarks</h1>
              <div className="flex space-x-2">
                <button
                  className={`p-2 rounded ${cardView === "list" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-400"}`}
                  onClick={() => setCardView("list")}
                  aria-label="List view"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/><rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/><rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/></svg>
                </button>
                <button
                  className={`p-2 rounded ${cardView === "grid" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-400"}`}
                  onClick={() => setCardView("grid")}
                  aria-label="Grid view"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor"/><rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor"/><rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor"/><rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Section */}
          <div className="px-8 pt-5 overflow-y-auto h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0"></div>
                </div>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-40 h-40 mb-6">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Favorite%20illustration-l25o0Haqveq5uoh66hFNScJ6uLYb4m.png"
                    alt="No bookmarks"
                    className="w-full h-full"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookmarks yet</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  Start saving to fill your Loft with links, social posts, images, and more
                </p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-full text-base font-medium transition-colors">
                  Discover Content
                </button>
              </div>
            ) : cardView === "list" ? (
              <div className="space-y-4">
                {bookmarks.map((bm: any) => {
                  const isExpanded = expandedId === bm.id;
                  return (
                    <div
                      key={bm.id}
                      className={`bg-white rounded-2xl shadow p-4 flex items-start cursor-pointer transition-all duration-200 w-full ${isExpanded ? "ring-2 ring-blue-400" : ""} ${isExpanded ? 'flex-col md:flex-row' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : bm.id)}
                    >
                      {/* Image or blank */}
                      {isExpanded ? (
                        <div className="w-full md:w-16 h-40 md:h-16 rounded-lg flex-shrink-0 mb-3 md:mb-0 md:mr-4 overflow-hidden">
                          {bm.image ? (
                            <img 
                              src={bm.image} 
                              alt={bm.title}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg flex-shrink-0 mr-4 overflow-hidden">
                          {bm.image ? (
                            <img 
                              src={bm.image} 
                              alt={bm.title}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                      )}
                      <div className={`flex-1 min-w-0 ${isExpanded ? 'w-full' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-lg truncate"><ReactMarkdown>{bm.title}</ReactMarkdown></span>
                          {/* Launch icon at end of row for mobile, only when expanded */}
                          {isExpanded && bm.url && (
                            <a 
                              href={bm.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="md:hidden text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <div className="md:hidden text-xs text-gray-400 mb-2">Created: {new Date(bm.created_at).toLocaleString()}</div>
                        <div className={`text-gray-500 text-sm ${isExpanded ? "" : "truncate"} ${isExpanded ? 'w-full' : ''}`}><ReactMarkdown>{bm.summary}</ReactMarkdown></div>
                        <div className="flex items-center mt-2 space-x-2 flex-wrap">
                          {(bm.tags || []).map((tag: string, i: number) => (
                            <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                          ))}
                          {(bm.collections || []).map((col: string, i: number) => (
                            <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                          ))}
                        </div>
                      </div>
                      {/* Remove the launch icon from the bottom right for expanded mobile cards */}
                      {(!isExpanded && bm.url) && (
                        <a 
                          href={bm.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-4 mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm: any) => (
                  <div
                    key={bm.id}
                    className="bg-white rounded-2xl shadow p-4 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => {
                      setSelectedBookmark(bm);
                      setShowModal(true);
                    }}
                  >
                    <div className="w-full h-48 rounded-lg mb-3 overflow-hidden">
                      {bm.image ? (
                        <img 
                          src={bm.image} 
                          alt={bm.title}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-lg truncate"><ReactMarkdown>{bm.title}</ReactMarkdown></span>
                      {bm.url && (
                        <a 
                          href={bm.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm truncate"><ReactMarkdown>{bm.summary}</ReactMarkdown></div>
                    <div className="flex items-center mt-2 space-x-2 flex-wrap">
                      {(bm.tags || []).map((tag: string, i: number) => (
                        <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                      ))}
                      {(bm.collections || []).map((col: string, i: number) => (
                        <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(bm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Bookmark Modal */}
        {showModal && selectedBookmark && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{selectedBookmark.title}</h2>
                    {selectedBookmark.url && (
                      <a 
                        href={selectedBookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-2"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                  {selectedBookmark.image ? (
                    <img 
                      src={selectedBookmark.image} 
                      alt={selectedBookmark.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="text-gray-600 mb-4">{selectedBookmark.summary}</div>
                <div className="flex items-center space-x-2 flex-wrap mb-4">
                  {(selectedBookmark.tags || []).map((tag: string, i: number) => (
                    <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                  ))}
                  {(selectedBookmark.collections || []).map((col: string, i: number) => (
                    <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Created: {new Date(selectedBookmark.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation - Hidden on Desktop */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
          <Link href="/bookmarks" className="flex flex-col items-center text-gray-500">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>
          <Link href="/library" className="flex flex-col items-center text-blue-500">
            <BookmarkIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Library</span>
          </Link>
          <Link href="/run-through" className="flex flex-col items-center text-gray-500">
            <Star className="h-6 w-6" />
            <span className="text-xs mt-1">Run through</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500">
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </nav>
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

      {/* Mobile Notification View */}
      {showNotifications && (
        <div className="md:hidden fixed inset-0 bg-[#f5f8fa] z-50 flex flex-col">
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
