"use client"
import { useRouter } from "next/navigation"
import { Link2, Upload, Camera, Plus, X } from "lucide-react"

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SaveModal({ isOpen, onClose }: SaveModalProps) {
  const router = useRouter()

  const handleOptionClick = (option: string) => {
    onClose()
    router.push(`/save?action=${option}`)
  }

  const options = [
    {
      id: "paste",
      icon: Link2,
      title: "Paste from clipboard",
      description: "https://in.pinterest.com/pin...",
      onClick: () => handleOptionClick("paste"),
    },
    {
      id: "upload",
      icon: Upload,
      title: "Upload",
      description: "image, video, pdf, etc.",
      onClick: () => handleOptionClick("upload"),
    },
    {
      id: "snap",
      icon: Camera,
      title: "Take snap",
      description: "Take photo or video",
      onClick: () => handleOptionClick("snap"),
    },
    {
      id: "create",
      icon: Plus,
      title: "Create",
      description: "create new note",
      onClick: () => handleOptionClick("create"),
    },
  ]

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: isOpen ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          width: "100%",
          maxWidth: "400px",
          padding: "0",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem 1.5rem 1rem 1.5rem",
            borderBottom: "none",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#111827",
              margin: 0,
              flex: 1,
              textAlign: "center",
            }}
          >
            Save to Loft
          </h2>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ height: "1.25rem", width: "1.25rem", color: "#6b7280" }} />
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
          {options.map((option, index) => {
            const IconComponent = option.icon
            return (
              <button
                key={option.id}
                onClick={option.onClick}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "0.5rem",
                  transition: "background-color 0.2s",
                  marginBottom: index < options.length - 1 ? "0.5rem" : "0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb"
                }}
                onTouchEnd={(e) => {
                  setTimeout(() => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }, 150)
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconComponent style={{ height: "1.25rem", width: "1.25rem", color: "#6b7280" }} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      marginBottom: "0.125rem",
                    }}
                  >
                    {option.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      lineHeight: "1.25",
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
