"use client"

import { useState, type FormEvent, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Search,
  Mic,
  BookmarkIcon,
  BarChart2,
  LogOut,
  Plus,
  Star,
  Grid,
  List,
  ArrowUpDown,
  X,
  Settings,
  Loader2,
  ExternalLink,
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { UserButton, SignedIn } from "@clerk/nextjs"

// Helper to convert ****text**** to **text**
function normalizeBold(str: string) {
  return str.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '**$1**');
}

function removeQuotes(str: string) {
  return str.replace(/^"|"$/g, '');
}

// Add this helper function after the existing helper functions
function highlightText(text: string, searchQuery: string) {
  if (!searchQuery.trim()) return text;
  
  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === searchQuery.toLowerCase() 
      ? `<span class="bg-yellow-200">${part}</span>` 
      : part
  ).join('');
}

export default function BookmarksPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("recent-saves")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [contentFilter, setContentFilter] = useState("all")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)
  const [collectionInput, setCollectionInput] = useState("")
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [availableCollections, setAvailableCollections] = useState([
    { id: "ui-mockup", name: "UI mockup", color: "bg-green-500" },
    { id: "inspiration", name: "Inspiration", color: "bg-purple-500" },
    { id: "design", name: "Design", color: "bg-blue-500" },
    { id: "development", name: "Development", color: "bg-yellow-500" },
  ])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cardView, setCardView] = useState<"list" | "grid">("list")
  const [expandedId, setExpandedId] = useState<string | number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [showInShortModal, setShowInShortModal] = useState(false)
  const [titleInput, setTitleInput] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTitle, setSavedTitle] = useState("")
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [isLoadingSearches, setIsLoadingSearches] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const DEFAULT_SUMMARY = "This is a sample description for the article you're saving.";
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add temporary state for success modal
  const [tempSavedImage, setTempSavedImage] = useState<string | null>(null);
  const [tempSavedTags, setTempSavedTags] = useState<string[]>([]);
  const [tempSavedCollections, setTempSavedCollections] = useState<string[]>([]);
  const [hasSelectedInterests, setHasSelectedInterests] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isCheckingInterests, setIsCheckingInterests] = useState(true)

  const defaultTags = [
    "design", "ui", "ux", "inspiration", "web", "mobile", "development",
    "code", "art", "photography", "minimalism", "modern"
  ]

  // Fetch bookmarks when Recent Saves tab is active
  useEffect(() => {
    if (activeTab === "recent-saves") {
      setIsLoading(true)
      fetch("/api/library")
        .then(res => res.json())
        .then(data => {
          setBookmarks(data.data || [])
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error fetching bookmarks:', error)
          setIsLoading(false)
        })
    }
  }, [activeTab])

  // Fetch saved searches when Search Saved tab is active
  useEffect(() => {
    if (activeTab === "search-saved") {
      setIsLoadingSearches(true)
      fetch("/api/bookmarks?type=saved-searches")
        .then(res => res.json())
        .then(data => {
          setSavedSearches(data.data || [])
          setIsLoadingSearches(false)
        })
        .catch(error => {
          console.error('Error fetching saved searches:', error)
          setIsLoadingSearches(false)
        })
    }
  }, [activeTab])

  // Handle search submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    
    // Always fetch fresh data when searching
    try {
      const response = await fetch("/api/library")
      const data = await response.json()
      const allBookmarks = data.data || []

      if (searchQuery.trim()) {
        // Save the search query
        try {
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ searchQuery: searchQuery.trim() }),
          })
        } catch (error) {
          console.error('Error saving search:', error)
        }

        // Filter bookmarks based on search query
        const filteredBookmarks = allBookmarks.filter((bm: { 
          title?: string; 
          summary?: string; 
          tags?: string[]; 
          collections?: string[] 
        }) => {
          const searchLower = searchQuery.toLowerCase()
          return (
            bm.title?.toLowerCase().includes(searchLower) ||
            bm.summary?.toLowerCase().includes(searchLower) ||
            bm.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
            bm.collections?.some((col: string) => col.toLowerCase().includes(searchLower))
          )
        })

        // Update the bookmarks state with filtered results
        setBookmarks(filteredBookmarks)
      } else {
        // If search query is empty, show all bookmarks
        setBookmarks(allBookmarks)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    // Reset bookmarks to original state
    fetch("/api/library")
      .then(res => res.json())
      .then(data => {
        setBookmarks(data.data || [])
      })
      .catch(error => {
        console.error('Error fetching bookmarks:', error)
      })
  }

  // Open save modal
  const openSaveModal = () => {
    setShowSaveModal(true)
  }

  // Close save modal
  const closeSaveModal = () => {
    setShowSaveModal(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!urlInput || selectedTags.length === 0 || selectedCollections.length === 0) {
      return;
    }

    try {
      setIsGenerating(true);
      setTitleInput("");
      setSummaryInput("");
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: urlInput,
          image: selectedImage 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process URL');
      }

      const data = await response.json();
      console.log('Title from LLM:', data.title);
      setTitleInput(data.title);
      setSummaryInput(data.summary);
      setShowInShortModal(true);
    } catch (error) {
      console.error('Error processing URL:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  // Close success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  // Toggle collection selection
  const toggleCollection = (collection: string) => {
    if (selectedCollections.includes(collection)) {
      setSelectedCollections(selectedCollections.filter((c) => c !== collection))
    } else {
      setSelectedCollections([...selectedCollections, collection])
    }
  }

  // Add function to toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  // Add function to close notifications
  const closeNotifications = () => {
    setShowNotifications(false)
  }

  // Interest selection logic
  const interests = [
    { id: "animals", name: "Animals", emoji: "🐰" },
    { id: "music", name: "Music", emoji: "🎵" },
    { id: "sports", name: "Sports", emoji: "🏄" },
    { id: "outdoor", name: "Outdoor activities", emoji: "🚴" },
    { id: "dancing", name: "Dancing", emoji: "💃" },
    { id: "healthy", name: "Healthy life", emoji: "🥗" },
    { id: "gym", name: "Gym & Fitness", emoji: "🏋️" },
    { id: "travel", name: "Travel", emoji: "✈️" },
    { id: "design", name: "Design", emoji: "👨‍💻" },
    { id: "cooking", name: "Cooking", emoji: "👨‍🍳" },
    { id: "technology", name: "Technology", emoji: "📱" },
    { id: "education", name: "Education", emoji: "📚" },
    { id: "fashion", name: "Fashion", emoji: "👗" },
    { id: "entertainment", name: "Entertainment", emoji: "📺" },
    { id: "yoga", name: "Yoga", emoji: "🧘‍♀️" },
    { id: "finance", name: "Finance", emoji: "💳" },
    { id: "productivity", name: "Productivity", emoji: "📊" },
  ]
  const mobileLayout = [
    [interests[0], interests[1], interests[2]],
    [interests[3], interests[4]],
    [interests[5], interests[6], interests[7]],
    [interests[8], interests[9]],
    [interests[10], interests[11]],
    [interests[12], interests[13], interests[14]],
    [interests[15], interests[16]],
  ]
  const desktopLayout = [
    [interests[0], interests[1], interests[2], interests[3], interests[4]],
    [interests[5], interests[6], interests[7], interests[8], interests[9]],
    [interests[10], interests[11], interests[12], interests[13], interests[14]],
    [interests[15], interests[16]],
  ]
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }
  const handleInterestSubmit = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save interests');
      }

      const data = await response.json();
      if (data.success) {
        setHasSelectedInterests(true);
        setUserInterests(selectedInterests);
        setShowInterestModal(false);
      }
    } catch (error) {
      console.error("Error submitting interests:", error);
    }
  }
  const InterestButton = ({ interest }: { interest: { id: string; name: string; emoji: string } }) => (
    <button
      key={interest.id}
      onClick={() => toggleInterest(interest.id)}
      className={`flex items-center rounded-full px-4 py-2 md:px-5 md:py-2.5 transition-colors shadow-sm border border-gray-200 font-medium text-sm md:text-base select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap gap-2 ${
        selectedInterests.includes(interest.id)
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      style={{ minWidth: '0', minHeight: '0' }}
    >
      <span className="text-lg md:text-xl">{interest.emoji}</span>
      <span className="font-medium">{interest.name}</span>
    </button>
  )

  const handleInShortSave = async () => {
    if (!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
      // Store temporary values for success modal
      setTempSavedImage(selectedImage);
      setTempSavedTags([...selectedTags]);
      setTempSavedCollections([...selectedCollections]);
      
      // Convert collection IDs to names
      const collectionNames = selectedCollections.map(collectionId => {
        const collection = availableCollections.find(c => c.id === collectionId);
        return collection ? collection.name : collectionId;
      });

      // Remove **** from title if present
      const cleanTitle = titleInput.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '$1');
      
      const response = await fetch('/api/bookmark-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cleanTitle,
          summary: summaryInput,
          url: urlInput,
          image: selectedImage,
          tags: selectedTags,
          collections: collectionNames
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save bookmark');
      }

      const data = await response.json();
      setShowInShortModal(false);
      setShowSaveModal(false);
      setShowSuccessModal(true);
      setSavedTitle(cleanTitle);
      
      // Reset form
      setUrlInput('');
      setTitleInput('');
      setSummaryInput('');
      setSelectedTags([]);
      setSelectedCollections([]);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving bookmark:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagInputFocus = () => {
    setShowTagDropdown(true)
    setShowCollectionDropdown(false)
  }

  const handleTagInputBlur = () => {
    // Delay hiding dropdown to allow for tag selection
    setTimeout(() => {
      setShowTagDropdown(false)
    }, 200)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleCollectionInputFocus = () => {
    setShowCollectionDropdown(true)
    setShowTagDropdown(false)
  }

  const handleCollectionInputBlur = () => {
    setTimeout(() => {
      setShowCollectionDropdown(false)
    }, 200)
  }

  const handleCollectionInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && collectionInput.trim()) {
      e.preventDefault();
      const newCollection = {
        id: collectionInput.trim().toLowerCase().replace(/\s+/g, '-'),
        name: collectionInput.trim(),
        color: "bg-gray-500" // Default color for custom collections
      };
      setAvailableCollections([...availableCollections, newCollection]);
      if (!selectedCollections.includes(newCollection.id)) {
        setSelectedCollections([...selectedCollections, newCollection.id]);
      }
      setCollectionInput("");
    }
  }

  const handleViewInLibrary = () => {
    closeSuccessModal();
    router.push('/library');
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

  // Add function to fetch AI summary
  const fetchAISummary = async () => {
    if (!urlInput) return;
    setIsSummaryLoading(true);
    try {
      const response = await fetch('/api/bookmarks/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummaryInput(data.summary);
    } catch (e) {
      // Optionally show error
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Add this useEffect to check if user has already selected interests when the component mounts
  useEffect(() => {
    const checkUserInterests = async () => {
      setIsCheckingInterests(true);
      try {
        const response = await fetch('/api/interests');
        const data = await response.json();
        if (data.success) {
          setHasSelectedInterests(data.hasInterests);
          setUserInterests(data.data);
          // Only show interest modal if user has no interests and no username
          if (data.hasInterests || data.username) {
            setShowInterestModal(false);
          } else {
            setShowInterestModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking user interests:', error);
      } finally {
        setIsCheckingInterests(false);
      }
    };
    checkUserInterests();
  }, []);

  return (
    <div className="flex h-screen bg-[#f5f8fa] overflow-hidden">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div
        className={`hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 ${showSaveModal ? "opacity-50" : ""}`}
      >
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
              className={`flex items-center px-2 py-3 rounded-full hover:bg-gray-100 transition-colors ${pathname === "/bookmarks" ? "text-blue-500 bg-gray-100" : "text-gray-900"}`}
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

            {/* MY COLLECTIONS moved here as a regular nav item */}
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
      <div className="flex-1 md:ml-60 flex flex-col h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-semibold">Explore</h1>
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
          <form onSubmit={handleSearch}>
            <div className="relative rounded-full bg-white flex items-center p-2 shadow-sm">
              <Search className="h-5 w-5 text-gray-500 ml-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={async (e) => {
                  const newQuery = e.target.value;
                  setSearchQuery(newQuery);
                  setIsSearching(true);
                  
                  try {
                    const response = await fetch("/api/library");
                    const data = await response.json();
                    const allBookmarks = data.data || [];

                    if (newQuery.trim()) {
                      // Filter bookmarks based on search query
                      const filteredBookmarks = allBookmarks.filter((bm: { 
                        title?: string; 
                        summary?: string; 
                        tags?: string[]; 
                        collections?: string[] 
                      }) => {
                        const searchLower = newQuery.toLowerCase();
                        return (
                          bm.title?.toLowerCase().includes(searchLower) ||
                          bm.summary?.toLowerCase().includes(searchLower) ||
                          bm.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
                          bm.collections?.some((col: string) => col.toLowerCase().includes(searchLower))
                        );
                      });
                      setBookmarks(filteredBookmarks);
                    } else {
                      // If search query is empty, show all bookmarks
                      setBookmarks(allBookmarks);
                    }
                  } catch (error) {
                    console.error('Error fetching bookmarks:', error);
                  }

                  // Simulate search delay
                  setTimeout(() => {
                    setIsSearching(false);
                  }, 300);
                }}
                className="w-full bg-transparent border-none focus:outline-none px-3 py-1 rounded-full"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="p-1 rounded-full">
                  <span className="sr-only">Clear search</span>
                  <span className="text-gray-500 text-xl">&times;</span>
                </button>
              )}
              <button type="submit" className="p-1 rounded-full">
                <Mic className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </form>
          {/* Content Type Filters */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar mt-4">
            <button
              onClick={() => setContentFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                contentFilter === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group flex items-center gap-2"
              title="Coming soon"
            >
              Links
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming Soon</span>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group flex items-center gap-2"
              title="Coming soon"
            >
              Images
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming Soon</span>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group flex items-center gap-2"
              title="Coming soon"
            >
              Notes
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming Soon</span>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group flex items-center gap-2"
              title="Coming soon"
            >
              Articles
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming Soon</span>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
          </div>
        </header>

        {/* Desktop Search and Create Section */}
        <div className="hidden md:flex flex-col p-4 bg-[#f5f8fa] border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative rounded-full bg-white flex items-center p-2 shadow-sm">
                <Search className="h-5 w-5 text-gray-500 ml-2" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={async (e) => {
                    const newQuery = e.target.value;
                    setSearchQuery(newQuery);
                    setIsSearching(true);
                    
                    try {
                      const response = await fetch("/api/library");
                      const data = await response.json();
                      const allBookmarks = data.data || [];

                      if (newQuery.trim()) {
                        // Filter bookmarks based on search query
                        const filteredBookmarks = allBookmarks.filter((bm: { 
                          title?: string; 
                          summary?: string; 
                          tags?: string[]; 
                          collections?: string[] 
                        }) => {
                          const searchLower = newQuery.toLowerCase();
                          return (
                            bm.title?.toLowerCase().includes(searchLower) ||
                            bm.summary?.toLowerCase().includes(searchLower) ||
                            bm.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
                            bm.collections?.some((col: string) => col.toLowerCase().includes(searchLower))
                          );
                        });
                        setBookmarks(filteredBookmarks);
                      } else {
                        // If search query is empty, show all bookmarks
                        setBookmarks(allBookmarks);
                      }
                    } catch (error) {
                      console.error('Error fetching bookmarks:', error);
                    }

                    // Simulate search delay
                    setTimeout(() => {
                      setIsSearching(false);
                    }, 300);
                  }}
                  className="w-full bg-transparent border-none focus:outline-none px-3 py-1 rounded-full"
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="p-1 rounded-full">
                    <span className="sr-only">Clear search</span>
                    <span className="text-gray-500 text-xl">&times;</span>
                  </button>
                )}
                <button type="submit" className="p-1 rounded-full">
                  <Mic className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </form>
            <button 
              onClick={openSaveModal}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full ml-4"
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>
          </div>
          {/* Content Type Filters */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setContentFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                contentFilter === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group"
              title="Coming soon"
            >
              Links
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group"
              title="Coming soon"
            >
              Images
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group"
              title="Coming soon"
            >
              Notes
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-200 text-gray-500 cursor-not-allowed relative group"
              title="Coming soon"
            >
              Articles
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming soon
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 flex flex-col p-4 md:p-8 bg-[#f5f8fa]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {searchPerformed ? (
              <div className="space-y-6">
                {/* Content Type Filters and Sort Options in Same Row */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setContentFilter("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        contentFilter === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setContentFilter("links")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        contentFilter === "links" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Links
                    </button>
                    <button
                      onClick={() => setContentFilter("images")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        contentFilter === "images" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Images
                    </button>
                    <button
                      onClick={() => setContentFilter("notes")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        contentFilter === "notes" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => setContentFilter("articles")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        contentFilter === "articles"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Articles
                    </button>
                  </div>

                  {/* Sort and View Options - Now in same row */}
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Sort by</span>
                      <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                        <span>Relevance</span>
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <Grid className="h-5 w-5 text-gray-700" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100">
                        <List className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* No Results Found State */}
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-40 h-40 mb-6">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Not%20Found%20illustration-UrvV2weSLaEBzWyuYMprcREhfZTEH3.png"
                      alt="No results found"
                      className="w-full h-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Result Found</h2>
                  <p className="text-gray-600 mb-8 max-w-md">Try refining your search or explore something new</p>

                  {/* Suggested Searches */}
                  <div className="w-full max-w-2xl">
                    <h3 className="text-gray-500 text-sm mb-4">Suggested Searches:</h3>
                    <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                      <button className="flex items-center bg-white rounded-full px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 shadow-sm">
                        <Search className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-gray-500" />
                        Recently Saved
                      </button>
                      <button className="flex items-center bg-white rounded-full px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 shadow-sm">
                        <Search className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-gray-500" />
                        AI-generated Picks
                      </button>
                      <button className="flex items-center bg-white rounded-full px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 shadow-sm">
                        <Search className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-gray-500" />
                        Popular in Your Collections
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Content based on active tab */}
                {activeTab === "recent-saves" ? (
                  <div className="mt-6">
                    {/* Fixed Recent Saves Header */}
                    <div className="sticky top-0 bg-[#f5f8fa] pt-4 pb-6 z-10">
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Recent Saves</h1>
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

                    {/* Add top padding so first card is not hidden behind sticky header */}
                    <div className="pt-8">
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
                      <div className="space-y-4 px-0">
                        {bookmarks.map((bm: any) => {
                          const isExpanded = expandedId === bm.id;
                          return (
                            <div
                              key={bm.id}
                              className={`bg-white rounded-2xl shadow p-4 flex items-start cursor-pointer transition-all duration-200 w-full max-w-full overflow-x-hidden ${isExpanded ? "ring-2 ring-inset ring-blue-400" : ""} ${isExpanded ? 'flex-col md:flex-row' : ''}`}
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
                  </div>
                ) : activeTab === "suggested-tags" ? (
                  <div className="mt-6">
                    {/* Fixed Suggested Tags Header */}
                    <div className="sticky top-0 bg-[#f5f8fa] pt-4 pb-6 z-10">
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Suggested Tags</h1>
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

                    {isLoading ? (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0"></div>
                        </div>
                      </div>
                    ) : Object.keys(bookmarks.reduce((acc: { [key: string]: any[] }, bm: any) => {
                      (bm.tags || []).forEach((tag: string) => {
                        if (!acc[tag]) acc[tag] = [];
                        acc[tag].push(bm);
                      });
                      return acc;
                    }, {})).length === 0 ? (
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
                    ) : (
                      <div className="px-4 md:px-8">
                        {/* Group bookmarks by tags */}
                        {Object.entries(
                          bookmarks.reduce((acc: { [key: string]: any[] }, bm: any) => {
                            (bm.tags || []).forEach((tag: string) => {
                              if (!acc[tag]) acc[tag] = [];
                              acc[tag].push(bm);
                            });
                            return acc;
                          }, {})
                        ).map(([tag, tagBookmarks]) => (
                          <div key={tag} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <h2 className="text-lg font-semibold text-gray-900">{tag}</h2>
                              <span className="text-sm text-gray-500">({tagBookmarks.length})</span>
                            </div>
                            {cardView === "list" ? (
                              <div className="px-4 md:px-8">
                                {/* List view */}
                                <div className="space-y-4 px-0">
                                  {tagBookmarks.map((bm: any) => {
                                    const cardKey = `${tag}-${bm.id}`;
                                    const isExpanded = expandedId === cardKey;
                                    return (
                                      <div
                                        key={bm.id}
                                        className={`bg-white rounded-2xl shadow p-4 mx-auto flex items-start cursor-pointer transition-all duration-200 ${isExpanded ? "ring-2 ring-inset ring-blue-400" : ""}`}
                                        onClick={() => setExpandedId(isExpanded ? null : cardKey)}
                                      >
                                        {/* Image or blank */}
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
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                            <span 
                                              className="font-semibold text-lg truncate"
                                              dangerouslySetInnerHTML={{ 
                                                __html: highlightText(bm.title || '', searchQuery) 
                                              }}
                                            />
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
                                          <div 
                                            className="text-gray-500 text-sm truncate"
                                            dangerouslySetInnerHTML={{ 
                                              __html: highlightText(bm.summary || '', searchQuery) 
                                            }}
                                          />
                                          <div className="flex items-center mt-2 space-x-2 flex-wrap">
                                            {(bm.tags || []).map((tag: string, i: number) => (
                                              <span 
                                                key={i} 
                                                className="bg-gray-200 text-xs rounded px-2 py-0.5"
                                                dangerouslySetInnerHTML={{ 
                                                  __html: highlightText(tag, searchQuery) 
                                                }}
                                              />
                                            ))}
                                            {(bm.collections || []).map((col: string, i: number) => (
                                              <span 
                                                key={i} 
                                                className="bg-green-200 text-xs rounded px-2 py-0.5"
                                                dangerouslySetInnerHTML={{ 
                                                  __html: highlightText(col, searchQuery) 
                                                }}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-400 ml-4 mt-2">{new Date(bm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="px-4 md:px-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {tagBookmarks.map((bm: any) => (
                                    <div key={bm.id} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer w-full p-4" onClick={() => { setSelectedBookmark(bm); setShowModal(true); }}>
                                      <div className="h-48 overflow-hidden rounded-t-2xl">
                                        {bm.image ? (
                                          <div className="w-full h-full overflow-hidden rounded-t-2xl">
                                            <img
                                              src={bm.image}
                                              alt={bm.title}
                                              className="w-full h-full object-cover rounded-2xl"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full h-full bg-gray-100 rounded-t-2xl" />
                                        )}
                                      </div>
                                      <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-semibold text-lg truncate whitespace-nowrap overflow-hidden"><ReactMarkdown>{removeQuotes(bm.title)}</ReactMarkdown></span>
                                          {bm.url && (
                                            <a 
                                              href={bm.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300"
                                            >
                                              Site
                                            </a>
                                          )}
                                        </div>
                                        <div className="text-gray-500 text-sm truncate whitespace-nowrap overflow-hidden"><ReactMarkdown>{bm.summary}</ReactMarkdown></div>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-2">
                                          {(bm.tags || []).map((tag: string, i: number) => (
                                            <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                                          ))}
                                          {(bm.collections || []).map((col: string, i: number) => (
                                            <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                                          ))}
                                          <div className="md:hidden">
                                            {bm.url && (
                                              <a
                                                href={bm.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 ml-1"
                                                style={{ marginTop: '2px' }} // optional, for vertical alignment
                                              >
                                                Site
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">{new Date(bm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeTab === "search-saved" ? (
                  <div className="mt-6">
                    {/* Fixed Search Saved Header */}
                    <div className="sticky top-0 bg-[#f5f8fa] pt-4 pb-6 z-10">
                      <h1 className="text-2xl font-bold">Saved Searches</h1>
                    </div>

                    {isLoadingSearches ? (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0"></div>
                        </div>
                      </div>
                    ) : savedSearches.length > 0 ? (
                      <div className="space-y-4">
                        {savedSearches.map((search) => (
                          <div
                            key={search.id}
                            className="bg-white rounded-2xl shadow p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              setSearchQuery(search.query);
                              setActiveTab("for-you");
                              setSearchPerformed(true);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <Search className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-900">{search.query}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(search.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-40 h-40 mb-6">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Not%20Found%20illustration-UrvV2weSLaEBzWyuYMprcREhfZTEH3.png"
                            alt="No saved searches"
                            className="w-full h-full"
                          />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Searches</h2>
                        <p className="text-gray-600 mb-8 max-w-md">
                          Your search history will appear here. Start searching to see your history.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
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
                )}
              </>
            )}
          </div>

          {/* Input Form - Fixed at bottom */}
          <div className="pt-4">
            {/* ... */}
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500 pb-4">
            {/* ... */}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Hidden on Desktop */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
          <Link href="/bookmarks" className="flex flex-col items-center text-blue-500">
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
          <div className="flex flex-col items-center text-gray-500">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{ 
                  elements: { 
                    avatarBox: 'w-6 h-6',
                    card: 'w-48',
                    userPreview: 'p-2',
                    userButtonPopoverCard: 'w-48',
                    userButtonPopoverActionButton: 'p-2 text-sm'
                  } 
                }} 
              />
            </SignedIn>
            <span className="text-xs mt-1">Settings</span>
          </div>
        </nav>

        {/* Mobile Save Button - Fixed at bottom right */}
        <button
          onClick={openSaveModal}
          className="md:hidden fixed right-4 bottom-20 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-10"
        >
          <Plus className="h-6 w-6" />
        </button>

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

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto z-50 flex md:block">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden" onClick={closeSaveModal}></div>
            {/* Modal */}
            <div className="relative bg-white w-[90%] max-w-md md:w-[480px] md:h-full md:max-w-none md:border-l border-gray-200 shadow-lg flex flex-col z-10 m-auto md:m-0 rounded-2xl md:rounded-none">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {showInShortModal ? "Save to InShort" : "Save to Loft"}
                </h2>
                <button onClick={closeSaveModal} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-none">
                <div className="p-6">
                  {/* Media Upload (shared) */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">Media Upload</h3>
                    <p className="text-sm text-gray-500 mb-2 md:mb-4">
                      Add your documents here, and you can upload up to 5 files max
                    </p>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center bg-gray-50">
                      {selectedImage ? (
                        <div className="relative w-full">
                          <img 
                            src={selectedImage} 
                            alt="Uploaded" 
                            className="w-full h-48 object-cover"
                          />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 md:h-6 md:w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-500 border border-blue-200 rounded-full px-4 py-1 hover:bg-blue-50"
                          >
                            Browse the image file to upload
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 md:mt-2">
                      Supported formats: JPG, PNG, GIF, SVG
                    </p>
                  </div>
                  {/* --- FORM AREA: This is the only part that changes! --- */}
                  {showInShortModal ? (
                    <>
                      {/* InShort Modal Form Fields */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">URL</h3>
                        <div className="relative">
                          <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://in.pinterest.com/pin/..."
                            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={isGenerating}
                          />
                          {isGenerating && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">Title</h3>
                        <input
                          type="text"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          placeholder={isGenerating ? "Generating title..." : "Title"}
                          className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                          disabled={isGenerating}
                        />
                        {titleInput && (
                          <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{titleInput}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">Summary</h3>
                        <div className="relative">
                          <textarea
                            value={summaryInput}
                            onChange={(e) => setSummaryInput(e.target.value)}
                            placeholder={isGenerating ? "Generating summary..." : "Summary"}
                            className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4 pr-10"
                            rows={4}
                            disabled={isGenerating}
                          />
                        </div>
                        {summaryInput && (
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{summaryInput}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Loft Modal Form Fields */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">URL</h3>
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://in.pinterest.com/pin/..."
                          className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">Tags <span className="text-red-500">*</span></h3>
                        <div className="relative">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 text-blue-500 hover:text-blue-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        <div className="flex items-center border border-gray-300 rounded-full p-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                              onFocus={handleTagInputFocus}
                              onBlur={handleTagInputBlur}
                              onKeyDown={handleTagInputKeyDown}
                              placeholder="Type and press Enter to add a tag"
                            className="flex-1 focus:outline-none rounded-full"
                          />
                            <button 
                              onClick={() => {
                                setShowTagDropdown(!showTagDropdown)
                                setShowCollectionDropdown(false)
                              }}
                              className="text-blue-500"
                            >
                            <Plus className="h-5 w-5" />
                          </button>
                          </div>
                          {showTagDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {tagInput.trim() && !defaultTags.includes(tagInput.trim()) && (
                                <button
                                  onClick={() => addTag(tagInput.trim())}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-blue-500"
                                >
                                  Add "{tagInput.trim()}"
                                </button>
                              )}
                              {defaultTags
                                .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                                .map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => addTag(tag)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                                  >
                                    {tag}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {/* Add to Collection (shared) */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-2">Add to Collection <span className="text-red-500">*</span></h3>
                    <div className="relative">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCollections.map((collectionId) => {
                          const collection = availableCollections.find(c => c.id === collectionId)
                          return collection ? (
                            <span
                              key={collection.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                            >
                              <div className={`w-3 h-3 ${collection.color} rounded-sm mr-1`}></div>
                              {collection.name}
                      <button
                                onClick={() => setSelectedCollections(selectedCollections.filter(id => id !== collectionId))}
                                className="ml-1 text-blue-500 hover:text-blue-700"
                              >
                                <X className="h-3 w-3" />
                      </button>
                            </span>
                          ) : null
                        })}
                      </div>
                      <div className="flex items-center border border-gray-300 rounded-full p-2">
                        <input
                          type="text"
                          value={collectionInput}
                          onChange={(e) => setCollectionInput(e.target.value)}
                          onFocus={handleCollectionInputFocus}
                          onBlur={handleCollectionInputBlur}
                          onKeyDown={handleCollectionInputKeyDown}
                          placeholder="Type and press Enter to add a collection"
                          className="flex-1 focus:outline-none rounded-full"
                        />
                      <button
                          onClick={() => {
                            setShowCollectionDropdown(!showCollectionDropdown)
                            setShowTagDropdown(false)
                          }}
                          className="text-blue-500"
                        >
                          <Plus className="h-5 w-5" />
                      </button>
                      </div>
                      {showCollectionDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {collectionInput.trim() && !availableCollections.some(c => c.name.toLowerCase() === collectionInput.trim().toLowerCase()) && (
                            <button
                              onClick={() => {
                                const newCollection = {
                                  id: collectionInput.trim().toLowerCase().replace(/\s+/g, '-'),
                                  name: collectionInput.trim(),
                                  color: "bg-gray-500"
                                };
                                setAvailableCollections([...availableCollections, newCollection]);
                                if (!selectedCollections.includes(newCollection.id)) {
                                  setSelectedCollections([...selectedCollections, newCollection.id]);
                                }
                                setCollectionInput("");
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-blue-500"
                            >
                              Add "{collectionInput.trim()}"
                            </button>
                          )}
                          {availableCollections
                            .filter(collection => collection.name.toLowerCase().includes(collectionInput.toLowerCase()))
                            .map((collection) => (
                              <button
                                key={collection.id}
                                onClick={() => {
                                  if (!selectedCollections.includes(collection.id)) {
                                    setSelectedCollections([...selectedCollections, collection.id]);
                                  }
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                              >
                                <div className={`w-4 h-4 ${collection.color} rounded-sm mr-2`}></div>
                                <span className="text-sm">{collection.name}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={closeSaveModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
                      disabled={isGenerating || isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={showInShortModal ? handleInShortSave : handleSave}
                      className={`px-4 py-2 rounded-full flex items-center justify-center min-w-[80px] ${
                        (!urlInput || selectedTags.length === 0 || selectedCollections.length === 0 || isGenerating || isSaving)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      disabled={!urlInput || selectedTags.length === 0 || selectedCollections.length === 0 || isGenerating || isSaving}
                    >
                      {isGenerating || isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : showInShortModal ? (
                        'Save'
                      ) : (
                        'Next'
                      )}
                    </button>
                  </div>
                </div>
                {/* Footer (shared) */}
                <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center rounded-b-2xl md:rounded-none">
                  <span>Powered by pxlbrain</span>
                  <div className="flex items-center space-x-3">
                    <span>Privacy</span>
                    <span>Report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black rounded-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-end p-4">
                <button onClick={closeSuccessModal} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/No%20Message%20illustration%402x-dMMxFHoaICtPNkD5zgwrnBZHRHCnnZ.png"
                    alt="Success"
                    className="w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-bold mb-2">Saved to Loft</h2>
                <p className="text-gray-600 mb-6">Your content is safe and ready to rediscover anytime</p>
                <div className="w-full max-w-sm">
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-start space-x-4">
                      {tempSavedImage && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <img
                            src={tempSavedImage}
                            alt="Saved content"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center mt-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {savedTitle}
                        </h3>
                        </div>
                        <div className="flex items-center mt-1">
                         
                          <div className="flex items-center text-xs text-gray-500">
                          
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                        
                          {tempSavedTags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                              {tag}
                            </span>
                          ))}
                          {tempSavedCollections.map((collectionId) => {
                            const collection = availableCollections.find(c => c.id === collectionId);
                            return collection ? (
                              <span key={collection.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                <div className={`w-2 h-2 ${collection.color} rounded-sm mr-1`}></div>
                                {collection.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleViewInLibrary}
                  className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  View in Library
                </button>
              </div>
            </div>
          </div>
        )}
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
                <span>Powered by pxlbrain</span>
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
        {/* Interest Modal with Loading State */}
        {isCheckingInterests ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your preferences...</p>
            </div>
          </div>
        ) : showInterestModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto p-6 flex flex-col items-center relative">
              <button
                onClick={() => setShowInterestModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select your interests?</h1>
              {/* Pills Grid Layout for All Interests */}
              <div className="w-full flex flex-wrap gap-3 justify-center mb-6">
                {interests.map((interest) => (
                  <InterestButton key={interest.id} interest={interest} />
                ))}
              </div>
              <button
                onClick={handleInterestSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full text-base font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        ) : null}
        {/* New Collection Modal */}
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
    </div>
  )
}
