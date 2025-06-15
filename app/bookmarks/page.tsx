"use client"

import { useState, type FormEvent, useRef, useEffect, useMemo } from "react"
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
  Upload,
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { UserButton, SignedIn } from "@clerk/nextjs"
import SaveModal from "@/components/save-modal"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Helper to convert ****text**** to **text**
function normalizeBold(str: string) {
  return str.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '**$1**');
}

function removeQuotes(str: string) {
  return str.replace(/^"|"$/g, '');
}

// 1. Add the SVG for the tag icon (from screenshot) as a React component at the top of the file:
const TagIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#7C6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.59 7.59a2 2 0 0 1-2.83 0l-7.59-7.59a2 2 0 0 1 0-2.83l7.59-7.59a2 2 0 0 1 2.83 0l7.59 7.59a2 2 0 0 1 0 2.83z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>
);

// 2. Add a helper to generate a random color for each tag (memoized per tag):
const tagColors = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-lime-100 text-lime-700 border-lime-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-orange-100 text-orange-700 border-orange-200"
];

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
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
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
  const [isLoadingSearches, setIsLoadingSearches] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const DEFAULT_SUMMARY = "This is a sample description for the article you're saving.";
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Add temporary state for success modal
  const [tempSavedImage, setTempSavedImage] = useState<string | null>(null);
  const [tempSavedTags, setTempSavedTags] = useState<string[]>([]);
  const [tempSavedCollections, setTempSavedCollections] = useState<string[]>([]);
  const [hasSelectedInterests, setHasSelectedInterests] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isCheckingInterests, setIsCheckingInterests] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notes, setNotes] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  const defaultTags = [
    "design", "ui", "ux", "inspiration", "web", "mobile", "development",
    "code", "art", "photography", "minimalism", "modern"
  ]

  const getTagColor = (tag: string) => {
    if (!tagColorMap.has(tag)) {
      tagColorMap.set(tag, tagColors[Math.floor(Math.random() * tagColors.length)]);
    }
    return tagColorMap.get(tag);
  };

  // Fetch bookmarks when Recent Saves tab is active
  useEffect(() => {
    if (activeTab === "recent-saves") {
      setIsLoadingLinks(true)
      fetch("/api/library")
        .then(res => res.json())
        .then(data => {
          setBookmarks(data.data || [])
          setIsLoadingLinks(false)
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
    
    try {
      let filteredBookmarks: any[] = []
      
      // Fetch data based on content filter
      if (contentFilter === "all") {
        const [linksData, notesData, imagesData] = await Promise.all([
          fetchLinks(),
          fetchNotes(),
          fetchImages()
        ])
        filteredBookmarks = [...linksData, ...notesData, ...imagesData]
      } else if (contentFilter === "links") {
        filteredBookmarks = await fetchLinks()
      } else if (contentFilter === "images") {
        filteredBookmarks = await fetchImages()
      } else if (contentFilter === "notes") {
        filteredBookmarks = await fetchNotes()
      }

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
        filteredBookmarks = filteredBookmarks.filter((bm: { 
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
      }

      // Update the bookmarks state with filtered results
      setBookmarks(filteredBookmarks)
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
    setIsLoading(true)
    
    // Fetch data based on content filter
    if (contentFilter === "all") {
      Promise.all([
        fetchLinks(),
        fetchNotes(),
        fetchImages()
      ]).then(([linksData, notesData, imagesData]) => {
        const allData = [...linksData, ...notesData, ...imagesData]
        setBookmarks(allData)
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    } else if (contentFilter === "links") {
      fetchLinks().then((linksData) => {
        setBookmarks(linksData)
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    } else if (contentFilter === "images") {
      fetchImages().then((imagesData) => {
        setBookmarks(imagesData)
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    } else if (contentFilter === "notes") {
      fetchNotes().then((notesData) => {
        setBookmarks(notesData)
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    }
  }

  // Open save modal
  const openSaveModal = () => {
    setShowSaveModal(true)
  }

  // Close save modal
  const closeSaveModal = () => {
    setShowSaveModal(false);
    setShowInShortModal(false);
    setUrlInput("");
    setSummaryInput("");
    setTitleInput("");
    setSelectedImage(null);
    setSelectedTags([]);
    setSelectedCollections([]);
    setTagInput("");
    setCollectionInput("");
    setMetadata(null);
    setError("");
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
    if (!titleInput.trim() || !summaryInput.trim() || selectedCollections.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      // Use default note image if no image is selected
      const imageToUse = selectedImage || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjI4RjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=";

      // Determine if this is a link or a note based on the URL input
      const isLink = urlInput && urlInput.trim().length > 0;
      const endpoint = isLink ? "/api/bookmark-save" : "/api/notes-save";

      const payload = {
        title: titleInput.trim(),
        summary: summaryInput.trim(),
        collections: selectedCollections,
        tags: selectedTags,
        image: imageToUse,
        type: "inshort",
        ...(isLink
          ? { url: urlInput.trim() }
          : { note: summaryInput.trim() } // Add note field for notes
        )
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(isLink ? "Failed to save bookmark" : "Failed to save note");
      }

      const data = await response.json();
      if (data.success) {
        setSavedTitle(titleInput);
        setShowInShortModal(false);
        setShowSuccessModal(true);
        setTitleInput("");
        setSummaryInput("");
        setUrlInput("");
        setSelectedTags([]);
        setSelectedCollections([]);
        setSelectedImage(null);
        setError("");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setError("Failed to save. Please try again.");
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Add function to fetch links
  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/library');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      // Prefix link IDs with 'link_'
      const processedLinks = data.data.map((link: any) => ({
        ...link,
        id: `link_${link.id}`,
        contentType: 'link'
      }));
      setLinks(processedLinks);
      return processedLinks;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  };

  // Add function to fetch notes
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes-save');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      if (!data.success) throw new Error('Failed to fetch notes');
      // Prefix note IDs with 'note_'
      const processedNotes = data.data.map((note: any) => ({
        ...note,
        id: `note_${note.id}`,
        contentType: 'note'
      }));
      setNotes(processedNotes);
      return processedNotes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  };

  // Add function to fetch images
  const fetchImages = async () => {
    try {
      const response = await fetch('/api/upload');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      // Prefix image IDs with 'image_'
      const processedImages = data.data.map((image: any) => ({
        ...image,
        id: `image_${image.id}`,
        contentType: 'image'
      }));
      setImages(processedImages);
      return processedImages;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  };

  // Add useEffect to fetch data when content filter changes
  useEffect(() => {
    if (contentFilter === "all") {
      // Fetch all data
      Promise.all([
        fetchLinks(),
        fetchNotes(),
        fetchImages()
      ]).then(() => {
        // Combine all data into bookmarks
        const allData = [...links, ...notes, ...images];
        setBookmarks(allData);
      });
    } else if (contentFilter === "links") {
      fetchLinks().then(() => {
        setBookmarks(links);
      });
    } else if (contentFilter === "images") {
      fetchImages().then(() => {
        setBookmarks(images);
      });
    } else if (contentFilter === "notes") {
      fetchNotes().then(() => {
        setBookmarks(notes);
      });
    }
  }, [contentFilter]);

  // Update the loading state check
  const isLoading = isLoadingLinks || isLoadingNotes || isLoadingImages;

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0"></div>
      </div>
    </div>
  );

  const handleUrlPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const url = e.clipboardData.getData('text');
    if (!url) return;

    try {
      setIsGenerating(true);
      setTitleInput("");
      setSummaryInput("");

      // First fetch metadata
      console.log('Fetching metadata for URL:', url);
      const metadataResponse = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const metadata = await metadataResponse.json();
      console.log('Received metadata:', metadata);

      // Always update the image preview if metadata contains an ogImage
      if (metadata.metadata.ogImage && metadata.metadata.ogImage.length > 0) {
        setSelectedImage(metadata.metadata.ogImage[0].url);
      }

      // Verify if the URL is from a social media platform
      console.log('Starting URL verification process...');
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          metadata: metadata.metadata
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify URL');
      }

      const verifyData = await verifyResponse.json();
      const isSocialMedia = verifyData.isSocialMedia;
      console.log('URL verification result:', { isSocialMedia });

      if (isSocialMedia) {
        console.log('Processing social media URL...');
        // For social media links, use the title from metadata and let user write summary
        setTitleInput(metadata.metadata.ogTitle || '');
        console.log('Set title from metadata:', metadata.metadata.ogTitle);
        setShowInShortModal(true);
      } else {
        console.log('Processing non-social media URL...');
        // For non-social media links, use the existing bookmark creation flow
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            url,
            image: selectedImage 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to process URL');
        }

        const data = await response.json();
        console.log('Received bookmark data:', data);
        setTitleInput(data.title);
        setSummaryInput(data.summary);
        setShowInShortModal(true);
      }
    } catch (error) {
      console.error('Error processing URL:', error);
      setError('Failed to process URL. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add this function after the other fetch functions
  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      if (data.success) {
        setAvailableCollections(data.data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // Add this useEffect to fetch collections when the component mounts
  useEffect(() => {
    fetchCollections();
  }, []);

  // Add this function after the other fetch functions
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.success) {
        setAvailableTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Add this useEffect to fetch tags when the component mounts
  useEffect(() => {
    fetchTags();
  }, []);

  // Add this function to handle tag creation
  const handleCreateTag = async () => {
    if (!tagInput.trim()) return;
    
    setIsCreatingTag(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tagInput.trim(),
          color: getRandomColor(),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailableTags(prev => [...prev, data.data]);
        setSelectedTags(prev => [...prev, data.data.name]);
        setTagInput('');
        setShowTagDropdown(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

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
                    let filteredBookmarks: any[] = []
                    
                    // Fetch data based on content filter
                    if (contentFilter === "all") {
                      const [linksData, notesData, imagesData] = await Promise.all([
                        fetchLinks(),
                        fetchNotes(),
                        fetchImages()
                      ])
                      filteredBookmarks = [...linksData, ...notesData, ...imagesData]
                    } else if (contentFilter === "links") {
                      filteredBookmarks = await fetchLinks()
                    } else if (contentFilter === "images") {
                      filteredBookmarks = await fetchImages()
                    } else if (contentFilter === "notes") {
                      filteredBookmarks = await fetchNotes()
                    }

                    if (newQuery.trim()) {
                      // Filter bookmarks based on search query
                      filteredBookmarks = filteredBookmarks.filter((bm: { 
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
                    }
                    setBookmarks(filteredBookmarks);
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
              <button type="submit" className="p-1 rounded-full hover:bg-gray-100">
                <Mic className="h-5 w-5 text-gray-700" />
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
              onClick={() => setContentFilter("links")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                contentFilter === "links" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Links
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
                      let filteredBookmarks: any[] = []
                      
                      // Fetch data based on content filter
                      if (contentFilter === "all") {
                        const [linksData, notesData, imagesData] = await Promise.all([
                          fetchLinks(),
                          fetchNotes(),
                          fetchImages()
                        ])
                        filteredBookmarks = [...linksData, ...notesData, ...imagesData]
                      } else if (contentFilter === "links") {
                        filteredBookmarks = await fetchLinks()
                      } else if (contentFilter === "images") {
                        filteredBookmarks = await fetchImages()
                      } else if (contentFilter === "notes") {
                        filteredBookmarks = await fetchNotes()
                      }

                      if (newQuery.trim()) {
                        // Filter bookmarks based on search query
                        filteredBookmarks = filteredBookmarks.filter((bm: { 
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
                      }
                      setBookmarks(filteredBookmarks);
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
                <button type="submit" className="p-1 rounded-full hover:bg-gray-100">
                  <Mic className="h-5 w-5 text-gray-700" />
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
                                <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
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
                              <span className="font-semibold text-lg truncate">
                                {bm.title || bm.note || 'Untitled'}
                              </span>
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
                            <div className="text-gray-500 text-sm truncate">
                              {bm.summary || bm.note || ''}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
                              {(bm.tags || []).map((tag: string, i: number) => (
                                <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                              ))}
                              {(bm.collections || []).map((col: string, i: number) => (
                                <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              {new Date(bm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
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
                <LoadingSpinner />
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
                                            <span className="font-semibold text-lg truncate"><ReactMarkdown>{bm.title}</ReactMarkdown></span>
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
                                          <div className={`text-gray-500 text-sm ${isExpanded ? "" : "truncate"}`}><ReactMarkdown>{bm.summary}</ReactMarkdown></div>
                                          <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
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
                                          {isExpanded && (
                                            <div className="mt-3">
                                              <div className="text-xs text-gray-400">Created: {new Date(bm.created_at).toLocaleString()}</div>
                                            </div>
                                          )}
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
                                        <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
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
              <LoadingSpinner />
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
          isMobile ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <SaveModal isOpen={showSaveModal} onClose={closeSaveModal} />
            </div>
          ) : (
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
                <div className="flex-grow overflow-y-auto">
                  <div className="p-6">
                    {/* Initial Form Fields */}
                    {!showInShortModal && (
                      <>
                        {/* URL Field - only show if no note is being created */}
                        <div className={`mb-6 ${summaryInput ? 'hidden' : 'block'}`}>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Enter link</h3>
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => {
                              setUrlInput(e.target.value);
                              if (e.target.value) {
                                setSummaryInput('');
                              }
                            }}
                            onPaste={(e) => {
                              const pastedText = e.clipboardData.getData('text');
                              setUrlInput(pastedText);
                              if (pastedText) {
                                setSummaryInput('');
                              }
                              handleUrlPaste(e);
                            }}
                            placeholder="https://example.com"
                            className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={isGenerating}
                          />
                          {selectedImage && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h3>
                              <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={selectedImage} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => setSelectedImage("")}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Note Field - only show if no URL is being pasted/typed */}
                        <div className={`mb-6 ${urlInput ? 'hidden' : 'block'}`}>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Create a note</h3>
                          <textarea
                            value={summaryInput}
                            onChange={(e) => {
                              setSummaryInput(e.target.value);
                              if (e.target.value) {
                                setUrlInput('');
                              }
                            }}
                            placeholder="Add a note..."
                            className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={4}
                          />
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 text-sm text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 flex items-center gap-1"
                              >
                                <Upload className="h-4 w-4" />
                                Upload Image
                              </button>
                              <span className="text-xs text-gray-500">(Optional)</span>
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                            <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                        {selectedImage ? (
                                <div className="relative w-full h-full">
                            <img 
                              src={selectedImage} 
                              alt="Uploaded" 
                                    className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                    onClick={() => setSelectedImage("")}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-white"
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
                                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={closeSaveModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              if (urlInput) {
                                // Handle URL paste
                                try {
                                  setIsGenerating(true);
                                  setTitleInput("");
                                  setSummaryInput("");

                                  // First fetch metadata
                                  const metadataResponse = await fetch('/api/metadata', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ url: urlInput }),
                                  });

                                  if (!metadataResponse.ok) {
                                    throw new Error('Failed to fetch metadata');
                                  }

                                  const metadata = await metadataResponse.json();
                                  setMetadata(metadata); // Store metadata in state

                                  // Update the image preview if metadata contains an image
                                  if (metadata.metadata.ogImage && metadata.metadata.ogImage[0]?.url) {
                                    setSelectedImage(metadata.metadata.ogImage[0].url);
                                  }

                                  // Verify if the URL is from a social media platform
                                  const verifyResponse = await fetch('/api/verify', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ 
                                      url: urlInput,
                                      metadata: metadata.metadata
                                    }),
                                  });

                                  if (!verifyResponse.ok) {
                                    throw new Error('Failed to verify URL');
                                  }

                                  const verifyData = await verifyResponse.json();
                                  const isSocialMedia = verifyData.isSocialMedia;

                                  if (isSocialMedia) {
                                    setTitleInput(metadata.metadata.title || '');
                                    // Keep the image from metadata for social media URLs
                                    if (metadata.metadata.image) {
                                      let imageUrl = metadata.metadata.image;
                                      if (imageUrl.startsWith('/')) {
                                        const urlObj = new URL(urlInput);
                                        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
                                      }
                                      setSelectedImage(imageUrl);
                                    }
                                    setShowInShortModal(true);
                                  } else {
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
                                    setTitleInput(data.title);
                                    setSummaryInput(data.summary);
                                    // Keep the image from metadata for non-social media URLs
                                    if (metadata.metadata.image) {
                                      let imageUrl = metadata.metadata.image;
                                      if (imageUrl.startsWith('/')) {
                                        const urlObj = new URL(urlInput);
                                        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
                                      }
                                      setSelectedImage(imageUrl);
                                    }
                                    setShowInShortModal(true);
                                  }
                                } catch (error) {
                                  console.error('Error processing URL:', error);
                                  setError('Failed to process URL. Please try again.');
                                } finally {
                                  setIsGenerating(false);
                                }
                              } else if (summaryInput) {
                                // Handle note creation
                                try {
                                  setIsGenerating(true);
                                  const response = await fetch('/api/notes', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      note: summaryInput
                                    }),
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to generate title and summary');
                                  }

                                  const data = await response.json();
                                  setTitleInput(data.title);
                                  setSummaryInput(data.summary);
                                  setShowInShortModal(true);
                                } catch (error) {
                                  console.error('Error generating title and summary:', error);
                                  setTitleInput('');
                                  setSummaryInput(summaryInput);
                                  setShowInShortModal(true);
                                } finally {
                                  setIsGenerating(false);
                                }
                              }
                            }}
                            disabled={(!urlInput && !summaryInput) || isGenerating}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-full ${
                              (!urlInput && !summaryInput) || isGenerating
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {isGenerating ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              </div>
                            ) : (
                              'Continue'
                            )}
                          </button>
                          </div>
                      </>
                    )}

                    {/* In-Short Modal Content */}
                    {showInShortModal && (
                      <div className="mt-6">
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Title</h3>
                          <input
                            type="text"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            placeholder="Enter title"
                            className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                              </div>

                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                            <textarea
                              value={summaryInput}
                              onChange={(e) => setSummaryInput(e.target.value)}
                            placeholder="Enter summary"
                            className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              rows={4}
                            />
                          </div>

                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h3>
                          <div className="w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                            {selectedImage ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={selectedImage} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <img 
                                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjI4RjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4="
                                  alt="Note Preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    padding: "2rem",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        </div>

                        {/* Tags Section */}
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2 rounded-xl">Tags <span className="text-red-500">*</span></h3>
                          {/* Tags Dropdown */}
                          <div className="relative">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {selectedTags.map((tag) => (
                                <div
                                  key={tag}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                  <span>{tag}</span>
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onFocus={() => setShowTagDropdown(true)}
                                onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="Add tags..."
                                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {showTagDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg">
                                  {tagInput && !availableTags.some(t => t.name.toLowerCase() === tagInput.toLowerCase()) && (
                                    <button
                                      onClick={handleCreateTag}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 rounded-t-xl"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Create "{tagInput}"
                                    </button>
                                  )}
                                  {availableTags
                                    .filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()))
                                    .map((tag, index, array) => (
                                      <button
                                        key={tag.id}
                                        onClick={() => {
                                          if (!selectedTags.includes(tag.name)) {
                                            setSelectedTags([...selectedTags, tag.name]);
                                          }
                                          setTagInput('');
                                          setShowTagDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${
                                          index === array.length - 1 ? 'rounded-b-xl' : ''
                                        }`}
                                      >
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                        {tag.name}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collections Section */}
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2 rounded-xl">Add to Collection <span className="text-red-500">*</span></h3>
                          {/* Collections Dropdown */}
                          <div className="relative">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {selectedCollections.map((collection) => (
                                <div
                                  key={collection}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                  <span>{collection}</span>
                                  <button
                                    onClick={() => removeTag(collection)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={collectionInput}
                                onChange={(e) => setCollectionInput(e.target.value)}
                                onFocus={() => setShowCollectionDropdown(true)}
                                onBlur={() => setTimeout(() => setShowCollectionDropdown(false), 200)}
                                onKeyDown={handleCollectionInputKeyDown}
                                placeholder="Add to collection..."
                                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {showCollectionDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg">
                                  {collectionInput && !availableCollections.some(c => c.name.toLowerCase() === collectionInput.toLowerCase()) && (
                                    <button
                                      onClick={() => {
                                        setNewCollectionName(collectionInput);
                                        setShowNewCollectionModal(true);
                                        setShowCollectionDropdown(false);
                                      }}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 rounded-t-xl"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Create "{collectionInput}"
                                    </button>
                                  )}
                                  {availableCollections
                                    .filter(c => c.name.toLowerCase().includes(collectionInput.toLowerCase()))
                                    .map((collection, index, array) => (
                                      <button
                                        key={collection.id}
                                        onClick={() => {
                                          if (!selectedCollections.includes(collection.name)) {
                                            setSelectedCollections([...selectedCollections, collection.name]);
                                          }
                                          setCollectionInput('');
                                          setShowCollectionDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${
                                          index === array.length - 1 ? 'rounded-b-xl' : ''
                                        }`}
                                      >
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: collection.color }} />
                                        {collection.name}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                      <button
                            onClick={handleInShortSave}
                            disabled={!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-full ${
                              !titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving
                            ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {isSaving ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              </div>
                            ) : (
                              'Save'
                        )}
                      </button>
                    </div>
                      </div>
                    )}
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
          )
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold mb-4 rounded-xl">Create New Collection</h3>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewCollectionModal(false);
                    setNewCollectionName('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={isCreatingCollection}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  {isCreatingCollection ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}