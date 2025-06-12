"use client"

import Link from "next/link"
import { useState, type FormEvent, useRef, useEffect } from "react"
import { Search, BookmarkIcon, BarChart2, LogOut, Plus, Star, Mic, ArrowUp, Settings, Grid, List, ArrowUpDown, X, Loader2, Tag, ExternalLink } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import { UserButton, SignedIn, useUser } from "@clerk/nextjs"

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  relatedTopics?: any[];
  isLoadingTopics?: boolean;
}

export default function RunThroughPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("for-you")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [contentFilter, setContentFilter] = useState("all")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showInShortModal, setShowInShortModal] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTitle, setSavedTitle] = useState("")
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [showCollectionSuggestions, setShowCollectionSuggestions] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    url?: string;
    title?: string;
    summary?: string;
    tags?: string;
    collections?: string;
  }>({})
  const [inputValue, setInputValue] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [cardView, setCardView] = useState<"list" | "grid">("list")
  const [expandedId, setExpandedId] = useState<string | number | null>(null)

  // Example prompts
  const examplePrompts = [
    {
      text: "Give the latest bookmark that I stored",
    },
    {
      text: "Give all the bookmarks",
    },
    {
      text: "Is there any bookmarks that I stored?",
    },
  ]

  // Default suggestions
  const defaultTags = [
    "web", "article", "design", "inspiration", "tutorial",
    "productivity", "technology", "business", "health", "education"
  ]

  const defaultCollections = [
    { id: "general", name: "General", color: "bg-gray-500" },
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-green-500" },
    { id: "research", name: "Research", color: "bg-purple-500" },
    { id: "inspiration", name: "Inspiration", color: "bg-pink-500" }
  ]

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = inputValue
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInputValue("")
    setIsLoading(true)

    try {
      // First call to get LLM response stream
      const response = await fetch('/api/run-through', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      if (!response.body) throw new Error('No response body')

      // Add initial assistant message without loading state
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '',
        relatedTopics: [],
        isLoadingTopics: false
      }])

      // Handle the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                // Update the last message with accumulated content
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = accumulatedContent
                  }
                  return newMessages
                })
              }
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }

      // After streaming is complete, set loading state for topics
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.isLoadingTopics = true
        }
        return newMessages
      })

      // Second call to get related topics
      const topicsResponse = await fetch('/api/run-through', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userMessage,
          type: 'related-topics'
        }),
      })

      if (!topicsResponse.ok) throw new Error('Failed to get related topics')

      const topicsData = await topicsResponse.json()
      if (topicsData.success) {
        // Update the last message with related topics and set loading to false
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.relatedTopics = topicsData.data.relatedTopics
            lastMessage.isLoadingTopics = false
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tag input
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
    setShowTagSuggestions(true)
  }

  // Add tag
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setTagInput("")
    setShowTagSuggestions(false)
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  // Toggle collection
  const toggleCollection = (collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  // Validate form
  const validateForm = () => {
    const errors: typeof formErrors = {}
    if (!urlInput) errors.url = "URL is required"
    if (!titleInput) errors.title = "Title is required"
    if (!summaryInput) errors.summary = "Summary is required"
    if (selectedTags.length === 0) errors.tags = "At least one tag is required"
    if (selectedCollections.length === 0) errors.collections = "At least one collection is required"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Update handleInShortSave
  const handleInShortSave = async () => {
    if (!validateForm()) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/bookmark-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleInput,
          summary: summaryInput,
          tags: selectedTags,
          collections: selectedCollections,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save bookmark')
      }

      setSavedTitle(titleInput)
      setShowSaveModal(false)
      setShowInShortModal(false)
      setShowSuccessModal(true)

      // Clear inputs
      setTitleInput('')
      setSummaryInput('')
      setUrlInput('')
      setSelectedTags([])
      setSelectedCollections([])
      setFormErrors({})

    } catch (error) {
      console.error('Error saving bookmark:', error)
    } finally {
      setIsSaving(false)
    }
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
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-semibold">Ask Loft AI</h1>
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
        <header className="md:hidden p-4 bg-[#f5f8fa] border-b border-gray-200">
          <h1 className="text-2xl font-semibold">Ask Loft AI</h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 flex flex-col px-4 md:px-8 bg-[#f5f8fa] overflow-y-auto [overflow-y:scroll] [-webkit-overflow-scrolling:touch]">
          <div className="flex-1 space-y-4 pb-20 md:pb-4">
            {messages.length === 0 ? (
              // Default Content
              <div className="flex flex-col h-full md:justify-center">
                {/* AI Greeting */}
                <div className="text-center mb-8 mt-8 md:mt-0">
                  <h2 className="text-2xl font-semibold mb-2">
                    Hi there, <span className="text-blue-500">
                      {user?.username || 
                       user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 
                       user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                       'there'}
                    </span>
                  </h2>
                  <p className="text-xl text-gray-700 mb-4">What would you like to know?</p>
                  <p className="text-gray-500">Use one of the most common prompts below or use your own to begin</p>
                </div>
                {/* Example Prompts */}
                <div className="mt-8">
                  <p className="text-gray-500 text-center mb-6">Try something like:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow text-left"
                        onClick={() => setInputValue(prompt.text)}
                      >
                        <p className="text-gray-700">"{prompt.text}"</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="flex flex-col space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div key={index}>
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-pre:bg-gray-100 prose-pre:rounded-md prose-pre:p-2 prose-pre:my-2 prose-a:text-blue-500 prose-a:underline hover:prose-a:text-blue-600">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Show related topics right after each assistant message */}
                    {message.role === 'assistant' && (
                      <div className="mt-4 px-4">
                        {message.content && !message.isLoadingTopics && message.relatedTopics && message.relatedTopics.length > 0 && (
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Related Topics</h3>
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
                        )}
                        {message.isLoadingTopics ? (
                          <div className={cardView === "list" ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
                            {[...Array(3)].map((_, idx) => (
                              <div
                                key={idx}
                                className={`bg-white rounded-2xl shadow p-4 ${cardView === "list" ? "flex items-start" : "flex flex-col"}`}
                              >
                                <div className={`${cardView === "list" ? "w-16 h-16 mr-4" : "w-full h-48 mb-3"} rounded-lg bg-gray-200 animate-pulse`} />
                                <div className="flex-1">
                                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : message.relatedTopics && message.relatedTopics.length > 0 ? (
                          cardView === "list" ? (
                            <div className="space-y-4">
                              {message.relatedTopics.map((topic, idx) => {
                                const isExpanded = expandedId === `${index}-${idx}`;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white rounded-2xl shadow p-4 flex items-start cursor-pointer transition-all duration-200 w-full max-w-full overflow-x-hidden ${isExpanded ? "ring-2 ring-inset ring-blue-400" : ""} ${isExpanded ? 'flex-col md:flex-row' : ''}`}
                                    onClick={() => setExpandedId(isExpanded ? null : `${index}-${idx}`)}
                                  >
                                    {/* Image or blank */}
                                    {isExpanded ? (
                                      <div className="w-full md:w-16 h-40 md:h-16 rounded-lg flex-shrink-0 mb-3 md:mb-0 md:mr-4 overflow-hidden">
                                        {topic.image ? (
                                          <img 
                                            src={topic.image} 
                                            alt={topic.title}
                                            className="w-full h-full object-cover rounded-2xl"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100" />
                                        )}
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-lg flex-shrink-0 mr-4 overflow-hidden">
                                        {topic.image ? (
                                          <img 
                                            src={topic.image} 
                                            alt={topic.title}
                                            className="w-full h-full object-cover rounded-2xl"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100" />
                                        )}
                                      </div>
                                    )}
                                    <div className={`flex-1 min-w-0 ${isExpanded ? 'w-full' : ''}`}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-lg truncate">{topic.title}</span>
                                        {isExpanded && topic.url && (
                                          <a 
                                            href={topic.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="md:hidden text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-2"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        )}
                                      </div>
                                      <div className="md:hidden text-xs text-gray-400 mb-2">Created: {new Date(topic.created_at).toLocaleString()}</div>
                                      <div className={`text-gray-500 text-sm ${isExpanded ? "" : "truncate"} ${isExpanded ? 'w-full' : ''}`}>{topic.summary}</div>
                                      <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
                                        {(topic.tags || []).map((tag: string, i: number) => (
                                          <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                                        ))}
                                        {(topic.collections || []).map((col: string, i: number) => (
                                          <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                                        ))}
                                      </div>
                                    </div>
                                    {(!isExpanded && topic.url) && (
                                      <a 
                                        href={topic.url} 
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
                              {message.relatedTopics.map((topic, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-2xl shadow p-4 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg"
                                  onClick={() => {
                                    setSelectedBookmark(topic);
                                    setShowModal(true);
                                  }}
                                >
                                  <div className="w-full h-48 rounded-lg mb-3 overflow-hidden">
                                    {topic.image ? (
                                      <img 
                                        src={topic.image} 
                                        alt={topic.title}
                                        className="w-full h-full object-cover rounded-2xl"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-100" />
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-lg truncate">{topic.title}</span>
                                    {topic.url && (
                                      <a 
                                        href={topic.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 flex items-center gap-1 bg-transparent ml-2"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-gray-500 text-sm truncate">{topic.summary}</div>
                                  <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
                                    {(topic.tags || []).map((tag: string, i: number) => (
                                      <span key={i} className="bg-gray-200 text-xs rounded px-2 py-0.5">{tag}</span>
                                    ))}
                                    {(topic.collections || []).map((col: string, i: number) => (
                                      <span key={i} className="bg-green-200 text-xs rounded px-2 py-0.5">{col}</span>
                                    ))}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-2">
                                    {new Date(topic.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-2xl px-4 py-2">
                      <p>Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Input Form - Always at the bottom */}
          <div className="fixed bottom-0 left-0 right-0 md:relative pt-4 bg-[#f5f8fa] pb-20 md:pb-0">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full px-4 md:px-0">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything?"
                  className="w-full py-3 px-4 pr-24 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button type="button" className="p-2 text-gray-700 hover:bg-gray-100 rounded-full" disabled={isLoading}>
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className={`p-2 rounded-full ${
                      inputValue && !isLoading ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}
                    disabled={!inputValue || isLoading}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500 pb-4">
            <div className="flex justify-center items-center space-x-4">
              <span>Powered by Loft</span>
              <span>Privacy</span>
              <span>Report</span>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Hidden on Desktop */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
          <Link href="/bookmarks" className="flex flex-col items-center text-gray-500">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>
          <Link href="/library" className="flex flex-col items-center text-gray-500">
            <BookmarkIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Library</span>
          </Link>
          <Link href="/run-through" className="flex flex-col items-center text-blue-500">
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
              <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 w-full">
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
    </div>
  )
}
