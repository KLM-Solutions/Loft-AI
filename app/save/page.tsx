"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Camera, Plus, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SavePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action") || "paste"
  const [isMobile, setIsMobile] = useState(false)
  const [showInShortModal, setShowInShortModal] = useState(false)
  const [titleInput, setTitleInput] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)
  const [collectionInput, setCollectionInput] = useState("")
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [tagColorMap] = useState(new Map<string, string>())
  const [selectedImage, setSelectedImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("paste")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savedTitle, setSavedTitle] = useState("")
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    summary: "",
    note: "",
  });
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const { toast } = useToast()

  // Add URL validation error state
  const [urlValidationError, setUrlValidationError] = useState("")
  // Add modal toast state
  const [modalToast, setModalToast] = useState<{show: boolean, title: string, description: string, type: 'error' | 'warning' | 'success'}>({
    show: false,
    title: '',
    description: '',
    type: 'error'
  });

  const tagColors = [
    "bg-red-100 text-red-700 border-red-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-red-100 text-red-700 border-red-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-lime-100 text-lime-700 border-lime-200",
    "bg-yellow-100 text-yellow-700 border-yellow-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-red-100 text-red-700 border-red-200"
  ];

  const getTagColor = (tag: string) => {
    if (!tagColorMap.has(tag)) {
      tagColorMap.set(tag, tagColors[Math.floor(Math.random() * tagColors.length)]);
    }
    return tagColorMap.get(tag);
  };

  const getRandomColor = () => {
    return tagColors[Math.floor(Math.random() * tagColors.length)];
  };

  // Add useEffect to fetch tags and collections on component mount
  useEffect(() => {
    fetchTags();
    fetchCollections();
  }, []);

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

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true);
      setCollectionsError("");
      const response = await fetch('/api/collections');
      const data = await response.json();
      if (data.success) {
        setAvailableCollections(data.data);
      } else {
        setCollectionsError("Failed to fetch collections");
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollectionsError("Failed to fetch collections");
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const handleCreateTag = async () => {
    if (!tagInput.trim()) return;
    
    // Check character limit
    if (tagInput.trim().length > 20) {
      showModalToast(
        "Tag too long",
        "Tag names must be 20 characters or less",
        'error'
      );
      return;
    }
    
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleBack = () => {
    router.back()
  }

  // Add URL validation function
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Add function to show modal toast
  const showModalToast = (title: string, description: string, type: 'error' | 'warning' | 'success' = 'error') => {
    setModalToast({
      show: true,
      title,
      description,
      type
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setModalToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Add function to hide modal toast
  const hideModalToast = () => {
    setModalToast(prev => ({ ...prev, show: false }));
  };

  const handleAddToBookmark = async () => {
    if (!formData.url) return;

    // Validate URL before proceeding
    if (!validateUrl(formData.url)) {
      setUrlValidationError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      setIsGenerating(true);
      setTitleInput("");
      setSummaryInput("");

      // First fetch metadata
      console.log('Fetching metadata for URL:', formData.url);
      const metadataResponse = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formData.url }),
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
          url: formData.url,
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
            url: formData.url,
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
      if (error instanceof Error && error.message === 'Failed to fetch metadata') {
        // Show modal toast for metadata fetching errors
        showModalToast(
          "Auto content fetch restricted",
          "Please enter additional details to enrich context",
          'warning'
        );
        // Allow user to proceed to next page after showing error
        setShowInShortModal(true);
      } else {
        // Show modal toast for other processing errors
        showModalToast(
          "Error processing URL",
          "Failed to process URL. Please try again.",
          'error'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInShortSave = async () => {
    if (!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Convert collection IDs to names
      const collectionNames = selectedCollections.map(collectionId => {
        const collection = availableCollections.find(c => c.id === collectionId);
        return collection ? collection.name : collectionId;
      });

      // Remove **** from title if present
      const cleanTitle = titleInput.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '$1');
      
      // Determine if this is a note or a bookmark
      const isNote = action === "create";
      const endpoint = isNote ? "/api/notes-save" : "/api/bookmark-save";
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cleanTitle,
          summary: summaryInput,
          ...(isNote ? { note: summaryInput } : { url: formData.url }),
          image: selectedImage,
          tags: selectedTags,
          collections: collectionNames
        }),
      });

      if (!response.ok) {
        throw new Error(isNote ? 'Failed to save note' : 'Failed to save bookmark');
      }

      const data = await response.json();
      setSavedTitle(cleanTitle);
      setShowInShortModal(false);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        url: "",
        title: "",
        summary: "",
        note: "",
      });
      setTitleInput("");
      setSummaryInput("");
      setSelectedTags([]);
      setSelectedCollections([]);
      setSelectedImage("");
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagInputFocus = () => {
    setShowTagDropdown(true)
    setShowCollectionDropdown(false)
  }

  const handleTagInputBlur = () => {
    setTimeout(() => {
      setShowTagDropdown(false)
    }, 200)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      
      // Check character limit
      if (tagInput.trim().length > 20) {
        showModalToast(
          "Tag too long",
          "Tag names must be 20 characters or less",
          'error'
        );
        return;
      }
      
      handleCreateTag();
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

  // Helper to set only one collection
  const setSingleCollection = (collectionId: string) => {
    setSelectedCollections([collectionId]);
  };

  const handleCollectionInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && collectionInput.trim()) {
      e.preventDefault();
      
      // Check character limit
      if (collectionInput.trim().length > 20) {
        showModalToast(
          "Collection name too long",
          "Collection names must be 20 characters or less",
          'error'
        );
        return;
      }
      
      try {
        const response = await fetch('/api/collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: collectionInput.trim(),
            color: "bg-gray-500"
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create collection');
        }

        const data = await response.json();
        if (data.success) {
          setAvailableCollections([...availableCollections, data.data]);
          setSelectedCollections([data.data.id]);
          setCollectionInput("");
        }
      } catch (error) {
        console.error('Error creating collection:', error);
      }
    }
  };

  const toggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections([collectionId]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPasteForm = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.25rem" : "1.5rem" }}>
      {!showInShortModal ? (
        <>
      <div>
        <h2
          style={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: "600",
            marginBottom: isMobile ? "0.75rem" : "1rem",
            lineHeight: "1.4",
          }}
        >
          Paste a URL Link to add a bookmark
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.875rem" : "1rem" }}>
          <div>
            <Label
              htmlFor="url"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Enter link
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, url: value }));
                
                // Clear validation error when user starts typing
                if (urlValidationError) {
                  setUrlValidationError("");
                }
                
                // Validate URL if it's not empty
                if (value.trim() && !validateUrl(value)) {
                  setUrlValidationError("Please enter a valid URL (e.g., https://example.com)");
                } else {
                  setUrlValidationError("");
                }
              }}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData('text');
                setFormData((prev) => ({ ...prev, url: pastedText }));
                
                // Validate the pasted URL
                if (pastedText.trim() && !validateUrl(pastedText)) {
                  setUrlValidationError("Please enter a valid URL (e.g., https://example.com)");
                } else {
                  setUrlValidationError("");
                }
              }}
                  placeholder="https://example.com"
              style={{
                width: "100%",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: urlValidationError ? "1px solid #ef4444" : "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto",
              }}
            />
            {urlValidationError && (
              <div style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                borderLeft: "4px solid #ef4444"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0 }}>
                    <svg style={{ height: "1.25rem", width: "1.25rem", color: "#ef4444" }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div style={{ marginLeft: "0.75rem" }}>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#991b1b", margin: 0 }}>
                      Invalid URL
                    </h3>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#dc2626" }}>
                      {urlValidationError}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleAddToBookmark}
                disabled={!formData.url || !validateUrl(formData.url) || isGenerating}
            style={{
              width: "100%",
                  backgroundColor: formData.url && validateUrl(formData.url) && !isGenerating ? "#ef4444" : "#9ca3af",
              color: "white",
              borderRadius: "0.75rem",
              padding: isMobile ? "0.875rem" : "0.75rem",
              border: "none",
                  cursor: formData.url && validateUrl(formData.url) && !isGenerating ? "pointer" : "not-allowed",
              fontSize: isMobile ? "1rem" : "0.875rem",
              fontWeight: "500",
              transition: "background-color 0.2s",
              minHeight: isMobile ? "48px" : "auto",
            }}
            onMouseEnter={(e) => {
                  if (formData.url && validateUrl(formData.url) && !isGenerating) {
                e.currentTarget.style.backgroundColor = "#ef4444"
              }
            }}
            onMouseLeave={(e) => {
                  if (formData.url && validateUrl(formData.url) && !isGenerating) {
                e.currentTarget.style.backgroundColor = "#ef4444"
              }
            }}
          >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'Continue'
                )}
          </Button>
        </div>  
      </div>    
        </>     
      ) : (     
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.25rem" : "1.5rem" }}>
      <div>     
        <h2    
          style={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: "600",
            marginBottom: isMobile ? "0.75rem" : "1rem",
          }}
        >
              Save to Loft
        </h2>
        
        {/* Modal Toast Notification */}
        {modalToast.show && (
          <div style={{
            margin: "0 0 1rem 0",
            padding: "1rem",
            borderRadius: "0.5rem",
            borderLeft: "4px solid",
            ...(modalToast.type === 'error' 
              ? { backgroundColor: "#fef2f2", borderLeftColor: "#ef4444", color: "#991b1b" }
              : modalToast.type === 'warning'
              ? { backgroundColor: "#fffbeb", borderLeftColor: "#f59e0b", color: "#92400e" }
              : { backgroundColor: "#f0fdf4", borderLeftColor: "#22c55e", color: "#166534" }
            )
          }}>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>
                {modalToast.type === 'error' ? (
                  <svg style={{ height: "1.25rem", width: "1.25rem", color: "#ef4444" }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : modalToast.type === 'warning' ? (
                  <svg style={{ height: "1.25rem", width: "1.25rem", color: "#f59e0b" }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg style={{ height: "1.25rem", width: "1.25rem", color: "#22c55e" }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div style={{ marginLeft: "0.75rem", flex: 1 }}>
                <h3 style={{ 
                  fontSize: "0.875rem", 
                  fontWeight: "500", 
                  margin: 0,
                  ...(modalToast.type === 'error' 
                    ? { color: "#991b1b" }
                    : modalToast.type === 'warning' 
                    ? { color: "#92400e" }
                    : { color: "#166534" }
                  )
                }}>
                  {modalToast.title}
                </h3>
                <div style={{ 
                  marginTop: "0.25rem", 
                  fontSize: "0.875rem",
                  ...(modalToast.type === 'error' 
                    ? { color: "#dc2626" }
                    : modalToast.type === 'warning' 
                    ? { color: "#d97706" }
                    : { color: "#16a34a" }
                  )
                }}>
                  {modalToast.description}
                </div>
              </div>
              <div style={{ marginLeft: "auto", paddingLeft: "0.75rem" }}>
                <button
                  onClick={hideModalToast}
                  style={{
                    display: "inline-flex",
                    borderRadius: "0.375rem",
                    padding: "0.375rem",
                    ...(modalToast.type === 'error' 
                      ? { color: "#ef4444" }
                      : modalToast.type === 'warning' 
                      ? { color: "#f59e0b" }
                      : { color: "#22c55e" }
                    )
                  }}
                >
                  <X style={{ height: "1rem", width: "1rem" }} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.875rem" : "1rem" }}>
          <div>
            <Label
                  htmlFor="url"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
                  URL
            </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    minHeight: isMobile ? "44px" : "auto",
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="image"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Image
                </Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center bg-gray-50">
                  {selectedImage ? (
                    <div className="relative w-full">
                      <img 
                        src={selectedImage} 
                        alt="Uploaded" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedImage("")}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 md:mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-full flex items-center justify-center">
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
                        className="text-sm text-red-500 border border-red-200 rounded-full px-4 py-1 hover:bg-red-50"
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

              <div>
                <Label
                  htmlFor="title"
              style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Enter title"
                  style={{
                width: "100%",
                    padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    minHeight: isMobile ? "44px" : "auto",
                    color: "#6B7280"
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="summary"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Summary
                </Label>
                <Textarea
                  id="summary"
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder="Enter summary"
                  style={{
                    width: "100%",
                    minHeight: isMobile ? "100px" : "120px",
                    padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    resize: "none",
                    fontFamily: "inherit",
                    color: "#6B7280"
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="tags"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Tags <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <div style={{ position: "relative", marginBottom: showTagDropdown ? "8rem" : "1rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          style={{
                            marginLeft: "0.25rem",
                            color: "#ef4444",
                          }}
                        >
                          <X style={{ height: "0.75rem", width: "0.75rem" }} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 20) {
                          setTagInput(value);
                        }
                      }}
                      onFocus={handleTagInputFocus}
                      onBlur={handleTagInputBlur}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add a tag"
                      maxLength={20}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: isMobile ? "1rem" : "0.875rem",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                      }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                      {tagInput.length}/20
                    </div>
                    <button
                      onClick={() => {
                        setShowTagDropdown(!showTagDropdown)
                        setShowCollectionDropdown(false)
                      }}
                      style={{ color: "#ef4444" }}
                    >
                      <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                    </button>
                  </div>
                  {showTagDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 10,
                        width: "100%",
                        marginTop: "0.5rem",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "0.5rem",
                        marginBottom: "0.5rem", // Changed from 1rem to 0.5rem (2 in Tailwind)
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {tagInput.trim() && !availableTags.some(t => t.name === tagInput.trim()) && (
                          <button
                            onClick={handleCreateTag}
                            disabled={isCreatingTag}
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "0.875rem",
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              border: "none",
                cursor: "pointer",
                            }}
                          >
                            
                            Create "{tagInput.trim()}"
                          </button>
                        )}
                        {availableTags.length === 0 && !tagInput.trim() && (
                          <div style={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            padding: "0.5rem 0.75rem"
                          }}>
                            No tags found
                          </div>
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
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="collections"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Add to Collection <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <div style={{ position: "relative", marginBottom: showCollectionDropdown ? "8rem" : "1rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {selectedCollections[0] && (() => {
                      const collection = availableCollections.find(c => c.id === selectedCollections[0]);
                      return collection ? (
                        <span key={collection.id} style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                          <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem", marginRight: "0.25rem" }}></div>
                          {collection.name}
                          <button onClick={() => setSelectedCollections([])} style={{ marginLeft: "0.25rem", color: "#ef4444" }}>
                            <X style={{ height: "0.75rem", width: "0.75rem" }} />
                          </button>
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                    <input
                      type="text"
                      value={collectionInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 20) {
                          setCollectionInput(value);
                        }
                      }}
                      onFocus={handleCollectionInputFocus}
                      onBlur={handleCollectionInputBlur}
                      onKeyDown={handleCollectionInputKeyDown}
                      placeholder="Type and press Enter to add a collection"
                      maxLength={20}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: isMobile ? "1rem" : "0.875rem",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                      }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                      {collectionInput.length}/20
                    </div>
                    <button
                      onClick={() => {
                        setShowCollectionDropdown(!showCollectionDropdown)
                        setShowTagDropdown(false)
                      }}
                        style={{ color: "#ef4444" }}
                    >
                      <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                    </button>
                  </div>
                  {showCollectionDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 10,
                        width: "100%",
                        marginTop: "0.5rem",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "0.5rem",
                        marginBottom: "1rem", // Add margin to push content below
                      }}
                    >
                      {isLoadingCollections ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="animate-spin h-5 w-5 text-red-500" />
                        </div>
                      ) : collectionsError ? (
                        <div className="text-red-500 text-sm p-2">{collectionsError}</div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {collectionInput.trim() && !availableCollections.some(c => c.name.toLowerCase() === collectionInput.trim().toLowerCase()) && (
                            <button
                              onClick={async () => {
                                // Check character limit
                                if (collectionInput.trim().length > 20) {
                                  showModalToast(
                                    "Collection name too long",
                                    "Collection names must be 20 characters or less",
                                    'error'
                                  );
                                  return;
                                }
                                
                                try {
                                  const response = await fetch('/api/collections', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      name: collectionInput.trim(),
                                      color: "bg-gray-500"
                                    }),
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to create collection');
                                  }

                                  const data = await response.json();
                                  if (data.success) {
                                    setAvailableCollections([...availableCollections, data.data]);
                                    setSelectedCollections([data.data.id]);
                                    setCollectionInput("");
                                  }
                                } catch (error) {
                                  console.error('Error creating collection:', error);
                                }
                              }}
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.875rem",
                                backgroundColor: "#dbeafe",
                                color: "#1d4ed8",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              Add "{collectionInput.trim()}"
                            </button>
                          )}
                          {availableCollections.length === 0 ? (
                            <div className="text-gray-500 text-sm p-2">No collections found</div>
                          ) : (
                            availableCollections
                              .filter(collection => collection.name.toLowerCase().includes(collectionInput.toLowerCase()))
                              .map((collection) => (
                                <button
                                  key={collection.id}
                                  onClick={() => setSingleCollection(collection.id)}
                                  style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "9999px",
                                    fontSize: "0.875rem",
                                    backgroundColor: "#dbeafe",
                                    color: "#1d4ed8",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                >
                                  <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem" }}></div>
                                  {collection.name}
                                </button>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
          </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <Button
                  onClick={() => {
                    setShowInShortModal(false);
                    setTitleInput("");
                    setSummaryInput("");
                    setSelectedTags([]);
                    setSelectedCollections([]);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "9999px",
                    backgroundColor: "transparent",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInShortSave}
                  disabled={!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving}
                  style={{
                    padding: "0.5rem 1rem",
                    color: "white",
                    borderRadius: "9999px",
                      backgroundColor: (!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving) ? "#9ca3af" : "#ef4444",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    cursor: (!titleInput || !summaryInput || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving) ? "not-allowed" : "pointer",
                    minWidth: "5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderUploadForm = () => (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: "600", color: "#111827", marginBottom: "0.5rem" }}>
          Upload an Image
        </h2>
        <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#6B7280" }}>
          Upload an image and we'll analyze it for you
        </p>
      </div>

      {!showInShortModal ? (
          <div>
          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="file"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Upload Image
            </Label>
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: "0.5rem",
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => document.getElementById("file")?.click()}
            >
              {selectedImage ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage("");
                    }}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <X style={{ height: "1rem", width: "1rem" }} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload style={{ height: "2rem", width: "2rem", color: "#6B7280", margin: "0 auto 1rem" }} />
                  <p style={{ color: "#6B7280", marginBottom: "0.5rem" }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              onClick={handleBack}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "#374151",
                backgroundColor: "#F3F4F6",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!selectedImage) return;
                
                try {
                  setIsGenerating(true);
                  setTitleInput("");
                  setSummaryInput("");

                  // Analyze the image using AI
                  const response = await fetch('/api/image', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                      image: selectedImage 
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to analyze image');
                  }

                  const data = await response.json();
                  setTitleInput(data.title);
                  setSummaryInput(data.summary);
                  setShowInShortModal(true);
                } catch (error) {
                  console.error('Error analyzing image:', error);
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to analyze image. Please try again.",
                    className: "bg-red-50 border-red-200"
                  });
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={!selectedImage || isGenerating}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "white",
                backgroundColor: !selectedImage || isGenerating ? "#9CA3AF" : "#ef4444",
                border: "none",
                borderRadius: "0.375rem",
                cursor: !selectedImage || isGenerating ? "not-allowed" : "pointer",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" style={{ height: "1rem", width: "1rem" }} />
                  Analyzing...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="title"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Title
            </Label>
            <input
              type="text"
              id="title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Enter title"
              style={{
                width: "100%",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="summary"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Summary
            </Label>
            <Textarea
              id="summary"
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Enter summary"
            style={{
              width: "100%",
                minHeight: isMobile ? "100px" : "120px",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
                resize: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="image"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Image Preview
            </Label>
            <div
              style={{
                width: "100%",
                height: isMobile ? "200px" : "250px",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9fafb",
                overflow: "hidden",
              }}
            >
              <img
                src={selectedImage}
                alt="Upload Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "1rem",
                }}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="tags"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Tags <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <div style={{ position: "relative", marginBottom: showTagDropdown ? "8rem" : "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        marginLeft: "0.25rem",
                        color: "#ef4444",
                      }}
                    >
                      <X style={{ height: "0.75rem", width: "0.75rem" }} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 20) {
                      setTagInput(value);
                    }
                  }}
                  onFocus={handleTagInputFocus}
                  onBlur={handleTagInputBlur}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter to add a tag"
                  maxLength={20}
                  style={{
                    flex: 1,
              border: "none",
                    outline: "none",
              fontSize: isMobile ? "1rem" : "0.875rem",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                  {tagInput.length}/20
                </div>
                <button
                  onClick={() => {
                    setShowTagDropdown(!showTagDropdown)
                    setShowCollectionDropdown(false)
                  }}
                    style={{ color: "#ef4444" }}
                >
                  <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                </button>
              </div>
              {showTagDropdown && (
                <div
                  style={{ 
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    marginTop: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "0.5rem",
                    marginBottom: "0.5rem", // Changed from 1rem to 0.5rem (2 in Tailwind)
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {tagInput.trim() && !availableTags.some(t => t.name === tagInput.trim()) && (
                      <button
                        onClick={handleCreateTag}
                        disabled={isCreatingTag}
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                          border: "none",
                cursor: "pointer",
                            }}
                          >
                            
                            Create "{tagInput.trim()}"
                          </button>
                        )}
                        {availableTags.length === 0 && !tagInput.trim() && (
                          <div style={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            padding: "0.5rem 0.75rem"
                          }}>
                            No tags found
                          </div>
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
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Label
                  htmlFor="collections"
                  style={{
                    fontSize: "0.875rem",
              fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Add to Collection <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <div style={{ position: "relative", marginBottom: showCollectionDropdown ? "8rem" : "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {selectedCollections[0] && (() => {
                  const collection = availableCollections.find(c => c.id === selectedCollections[0]);
                  return collection ? (
                    <span key={collection.id} style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                      <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem", marginRight: "0.25rem" }}></div>
                      {collection.name}
                      <button onClick={() => setSelectedCollections([])} style={{ marginLeft: "0.25rem", color: "#ef4444" }}>
                        <X style={{ height: "0.75rem", width: "0.75rem" }} />
                      </button>
                    </span>
                  ) : null;
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                <input
                  type="text"
                  value={collectionInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 20) {
                      setCollectionInput(value);
                    }
                  }}
                  onFocus={handleCollectionInputFocus}
                  onBlur={handleCollectionInputBlur}
                  onKeyDown={handleCollectionInputKeyDown}
                  placeholder="Type and press Enter to add a collection"
                  maxLength={20}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                  {collectionInput.length}/20
                </div>
                <button
                  onClick={() => {
                    setShowCollectionDropdown(!showCollectionDropdown)
                    setShowTagDropdown(false)
                  }}
                  style={{ color: "#ef4444" }}
                >
                  <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                </button>
              </div>
              {showCollectionDropdown && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    marginTop: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "0.5rem",
                    marginBottom: "1rem", // Add margin to push content below
                  }}
                >
                  {isLoadingCollections ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="animate-spin h-5 w-5 text-red-500" />
                    </div>
                  ) : collectionsError ? (
                    <div className="text-red-500 text-sm p-2">{collectionsError}</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {collectionInput.trim() && !availableCollections.some(c => c.name.toLowerCase() === collectionInput.trim().toLowerCase()) && (
                        <button
                          onClick={async () => {
                            // Check character limit
                            if (collectionInput.trim().length > 20) {
                              showModalToast(
                                "Collection name too long",
                                "Collection names must be 20 characters or less",
                                'error'
                              );
                              return;
                            }
                            
                            try {
                              const response = await fetch('/api/collections', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  name: collectionInput.trim(),
                                  color: "bg-gray-500"
                                }),
                              });

                              if (!response.ok) {
                                throw new Error('Failed to create collection');
                              }

                              const data = await response.json();
                              if (data.success) {
                                setAvailableCollections([...availableCollections, data.data]);
                                setSelectedCollections([data.data.id]);
                                setCollectionInput("");
                              }
                            } catch (error) {
                              console.error('Error creating collection:', error);
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Add "{collectionInput.trim()}"
                        </button>
                      )}
                      {availableCollections.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No collections found</div>
                      ) : (
                        availableCollections
                          .filter(collection => collection.name.toLowerCase().includes(collectionInput.toLowerCase()))
                          .map((collection) => (
                            <button
                              key={collection.id}
                              onClick={() => setSingleCollection(collection.id)}
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.875rem",
                                backgroundColor: "#dbeafe",
                                color: "#1d4ed8",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem" }}></div>
                              {collection.name}
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowInShortModal(false)}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "#374151",
                backgroundColor: "#F3F4F6",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Back
            </button>
            <button
              onClick={async () => {
                if (!titleInput || !summaryInput || !selectedImage || selectedTags.length === 0 || selectedCollections.length === 0) return;
                setIsSaving(true);
                try {
                  // Convert collection IDs to names
                  const collectionNames = selectedCollections.map(collectionId => {
                    const collection = availableCollections.find(c => c.id === collectionId);
                    return collection ? collection.name : collectionId;
                  });

                  const response = await fetch("/api/image-save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: titleInput,
                      summary: summaryInput,
                      image: selectedImage,
                      tags: selectedTags,
                      collections: collectionNames
                    }),
                  });
                  const data = await response.json();
                  if (data.success) {
                    setSavedTitle(titleInput);
                    setShowInShortModal(false);
                    setShowSuccessModal(true);
                    
                    // Reset form
                    setFormData({
                      url: "",
                      title: "",
                      summary: "",
                      note: "",
                    });
                    setTitleInput("");
                    setSummaryInput("");
                    setSelectedTags([]);
                    setSelectedCollections([]);
                    setSelectedImage("");
                  }
                } catch (error) {
                  console.error("Error saving image:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={!titleInput || !summaryInput || !selectedImage || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "white",
                backgroundColor: !titleInput || !summaryInput || !selectedImage || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving ? "#9CA3AF" : "#ef4444",
                border: "none",
                borderRadius: "0.375rem",
                cursor: !titleInput || !summaryInput || !selectedImage || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving ? "not-allowed" : "pointer",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" style={{ height: "1rem", width: "1rem" }} />
                  Saving...
                </>
              ) : (
                "Add to Bookmarks"
              )}
            </button>
        </div>
      </div>
      )}
    </div>
  )

  const renderCreateForm = () => (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: "600", color: "#111827", marginBottom: "0.5rem" }}>
          Create a New Note
        </h2>
        <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#6B7280" }}>
          Write your note and we'll help you organize it
        </p>
      </div>

      {!showInShortModal ? (
      <div>
          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="note"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Write your note
            </Label>
            <Textarea
              id="note"
              value={formData.note || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Start writing your note here..."
              style={{
                width: "100%",
                minHeight: isMobile ? "200px" : "300px",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
                resize: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <Upload style={{ height: "0.875rem", width: "0.875rem" }} />
                Upload Image
              </button>
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>(Optional)</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleBack}
                style={{
                  padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                  fontSize: isMobile ? "0.875rem" : "0.75rem",
                  color: "#374151",
                  backgroundColor: "#F3F4F6",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!formData.note) return;
                  setIsGenerating(true);
                  try {
                    const response = await fetch('/api/notes', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        note: formData.note
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
                    // If API fails, still show modal but with empty title/summary
                    setTitleInput('');
                    setSummaryInput(formData.note);
                    setShowInShortModal(true);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={!formData.note || isGenerating}
                style={{
                  padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                  fontSize: isMobile ? "0.875rem" : "0.75rem",
                  color: "white",
                  backgroundColor: !formData.note || isGenerating ? "#9CA3AF" : "#ef4444",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: !formData.note || isGenerating ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" style={{ height: "1rem", width: "1rem" }} />
                    Generating...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
          <div>
          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="title"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Title
            </Label>
            <input
              type="text"
              id="title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Enter title"
              style={{
                width: "100%",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="summary"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Summary
            </Label>
            <Textarea
              id="summary"
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Enter summary"
              style={{
                width: "100%",
                minHeight: isMobile ? "100px" : "120px",
                padding: isMobile ? "0.75rem" : "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: isMobile ? "1rem" : "0.875rem",
                resize: "none",
                fontFamily: "inherit",
                color: "#6B7280"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Label
              htmlFor="image"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Note Preview
            </Label>
            <div
              style={{
                width: "100%",
                height: isMobile ? "200px" : "250px",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                backgroundColor: "#f9fafb",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {selectedImage ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img
                    src={selectedImage}
                    alt="Note Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      padding: "0",
                    }}
                  />
                  <button
                    onClick={() => setSelectedImage("")}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                    border: "none",
                      borderRadius: "9999px",
                      padding: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <X style={{ height: "1rem", width: "1rem" }} />
                  </button>
                </div>
              ) : (
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
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="tags"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Tags <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <div style={{ position: "relative", marginBottom: showTagDropdown ? "8rem" : "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                    marginLeft: "0.25rem",
                        color: "#ef4444",
                      }}
                    >
                      <X style={{ height: "0.75rem", width: "0.75rem" }} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 20) {
                      setTagInput(value);
                    }
                  }}
                  onFocus={handleTagInputFocus}
                  onBlur={handleTagInputBlur}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter to add a tag"
                  maxLength={20}
                  style={{
                    flex: 1,
              border: "none",
                    outline: "none",
              fontSize: isMobile ? "1rem" : "0.875rem",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                  {tagInput.length}/20
                </div>
                <button
                  onClick={() => {
                    setShowTagDropdown(!showTagDropdown)
                    setShowCollectionDropdown(false)
                  }}
                    style={{ color: "#ef4444" }}
                >
                  <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                </button>
              </div>
              {showTagDropdown && (
                <div
                  style={{ 
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    marginTop: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "0.5rem",
                    marginBottom: "0.5rem", // Changed from 1rem to 0.5rem (2 in Tailwind)
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {tagInput.trim() && !availableTags.some(t => t.name === tagInput.trim()) && (
                      <button
                        onClick={handleCreateTag}
                        disabled={isCreatingTag}
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                          border: "none",
                cursor: "pointer",
                            }}
                          >
                            
                            Create "{tagInput.trim()}"
                          </button>
                        )}
                        {availableTags.length === 0 && !tagInput.trim() && (
                          <div style={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            padding: "0.5rem 0.75rem"
                          }}>
                            No tags found
                          </div>
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
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Label
                  htmlFor="collections"
                  style={{
                    fontSize: "0.875rem",
              fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Add to Collection <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <div style={{ position: "relative", marginBottom: showCollectionDropdown ? "8rem" : "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {selectedCollections[0] && (() => {
                  const collection = availableCollections.find(c => c.id === selectedCollections[0]);
                  return collection ? (
                    <span key={collection.id} style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                      <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem", marginRight: "0.25rem" }}></div>
                      {collection.name}
                      <button onClick={() => setSelectedCollections([])} style={{ marginLeft: "0.25rem", color: "#ef4444" }}>
                        <X style={{ height: "0.75rem", width: "0.75rem" }} />
                      </button>
                    </span>
                  ) : null;
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "9999px", padding: "0.5rem" }}>
                <input
                  type="text"
                  value={collectionInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 20) {
                      setCollectionInput(value);
                    }
                  }}
                  onFocus={handleCollectionInputFocus}
                  onBlur={handleCollectionInputBlur}
                  onKeyDown={handleCollectionInputKeyDown}
                  placeholder="Add a collection"
                  maxLength={20}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginRight: "0.5rem" }}>
                  {collectionInput.length}/20
                </div>
                <button
                  onClick={() => {
                    setShowCollectionDropdown(!showCollectionDropdown)
                    setShowTagDropdown(false)
                  }}
                  style={{ color: "#ef4444" }}
                >
                  <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
                </button>
              </div>
              {showCollectionDropdown && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    marginTop: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "0.5rem",
                    marginBottom: "1rem", // Add margin to push content below
                  }}
                >
                  {isLoadingCollections ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="animate-spin h-5 w-5 text-red-500" />
                    </div>
                  ) : collectionsError ? (
                    <div className="text-red-500 text-sm p-2">{collectionsError}</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {collectionInput.trim() && !availableCollections.some(c => c.name.toLowerCase() === collectionInput.trim().toLowerCase()) && (
                        <button
                          onClick={async () => {
                            // Check character limit
                            if (collectionInput.trim().length > 20) {
                              showModalToast(
                                "Collection name too long",
                                "Collection names must be 20 characters or less",
                                'error'
                              );
                              return;
                            }
                            
                            try {
                              const response = await fetch('/api/collections', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  name: collectionInput.trim(),
                                  color: "bg-gray-500"
                                }),
                              });

                              if (!response.ok) {
                                throw new Error('Failed to create collection');
                              }

                              const data = await response.json();
                              if (data.success) {
                                setAvailableCollections([...availableCollections, data.data]);
                                setSelectedCollections([data.data.id]);
                                setCollectionInput("");
                              }
                            } catch (error) {
                              console.error('Error creating collection:', error);
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Add "{collectionInput.trim()}"
                        </button>
                      )}
                      {availableCollections.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No collections found</div>
                      ) : (
                        availableCollections
                          .filter(collection => collection.name.toLowerCase().includes(collectionInput.toLowerCase()))
                          .map((collection) => (
                            <button
                              key={collection.id}
                              onClick={() => setSingleCollection(collection.id)}
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.875rem",
                                backgroundColor: "#dbeafe",
                                color: "#1d4ed8",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: collection.color, borderRadius: "0.125rem" }}></div>
                              {collection.name}
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowInShortModal(false)}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "#374151",
                backgroundColor: "#F3F4F6",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Back
            </button>
            <button
              onClick={async () => {
                if (!titleInput || !summaryInput || !formData.note || selectedTags.length === 0 || selectedCollections.length === 0) return;
                setIsSaving(true);
                try {
                  // Convert collection IDs to names
                  const collectionNames = selectedCollections.map(collectionId => {
                    const collection = availableCollections.find(c => c.id === collectionId);
                    return collection ? collection.name : collectionId;
                  });

                  const response = await fetch("/api/notes-save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: titleInput,
                      summary: summaryInput,
                      note: formData.note,
                      tags: selectedTags,
                      collections: collectionNames,
                      image: selectedImage || null
                    }),
                  });
                  const data = await response.json();
                  if (data.success) {
                    setSavedTitle(titleInput);
                    setShowInShortModal(false);
                    setShowSuccessModal(true);
                    
                    // Reset form
                    setFormData({
                      url: "",
                      title: "",
                      summary: "",
                      note: "",
                    });
                    setTitleInput("");
                    setSummaryInput("");
                    setSelectedTags([]);
                    setSelectedCollections([]);
                    setSelectedImage("");
                  }
                } catch (error) {
                  console.error("Error saving note:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={!titleInput || !summaryInput || !formData.note || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.5rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.75rem",
                color: "white",
                backgroundColor: !titleInput || !summaryInput || !formData.note || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving ? "#9CA3AF" : "#ef4444",
                border: "none",
                borderRadius: "0.375rem",
                cursor: !titleInput || !summaryInput || !formData.note || selectedTags.length === 0 || selectedCollections.length === 0 || isSaving ? "not-allowed" : "pointer",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" style={{ height: "1rem", width: "1rem" }} />
                  Saving...
                </>
              ) : (
                "Add to Bookmarks"
              )}
            </button>
        </div>
      </div>
      )}
    </div>
  )

  const renderSnapForm = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.25rem" : "1.5rem" }}>
      <div style={{ textAlign: "center", padding: isMobile ? "2rem 0" : "3rem 0" }}>
        <Camera
          style={{
            height: isMobile ? "3rem" : "4rem",
            width: isMobile ? "3rem" : "4rem",
            color: "#9ca3af",
            margin: "0 auto 1rem auto",
          }}
        />
        <h2
          style={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          Take Snap
        </h2>
        <p style={{ color: "#6b7280" }}>Coming Soon</p>
      </div>
    </div>
  )

  const getPageTitle = () => {
    switch (action) {
      case "upload":
        return "Upload File"
      case "create":
        return "Create Note"
      case "snap":
        return "Take Snap"
      default:
        return "Save to Loft"
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <div style={{ maxWidth: isMobile ? "100%" : "28rem", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.75rem" : "1rem",
            padding: isMobile ? "0.875rem 1rem" : "1rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Button
            onClick={handleBack}
            style={{
              height: isMobile ? "2.5rem" : "2rem",
              width: isMobile ? "2.5rem" : "2rem",
              padding: "0",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft
              style={{
                height: isMobile ? "1.5rem" : "1.25rem",
                width: isMobile ? "1.5rem" : "1.25rem",
              }}
            />
          </Button>
          <h1
            style={{
              fontSize: isMobile ? "1.125rem" : "1.25rem",
              fontWeight: "600",
            }}
          >
            {getPageTitle()}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? "1rem" : "1rem" }}>
          {action === "paste" && renderPasteForm()}
          {action === "upload" && renderUploadForm()}
          {action === "create" && renderCreateForm()}
          {action === "snap" && renderSnapForm()}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black rounded-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-end p-4">
              <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-4">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2d5DYX8mw9Ikry6x6D2il3jhJuXlzR.png"
                  alt="Success"
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-xl font-bold mb-2">Saved to Loft</h2>
              <p className="text-gray-600 mb-6">Your content is safe and ready to rediscover anytime</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/library');
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  View Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
