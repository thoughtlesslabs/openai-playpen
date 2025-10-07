import { useState, useEffect, useCallback } from "react"
import { render, useKeyboard } from "@opentui/react"
import { TextAttributes } from "@opentui/core"
import OpenAI from "openai"

const App = () => {
  const [apiKey, setApiKey] = useState(process.env.OPENAI_API_KEY || "")
  const [saveLocation, setSaveLocation] = useState("./videos")
  const [screen, setScreen] = useState<"setup" | "main" | "help">("setup")
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<"idle" | "creating" | "polling" | "downloading" | "completed" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")
  const [focused, setFocused] = useState<"prompt" | "apikey" | "location">("apikey")

  useKeyboard((key) => {
    if (key.name === "tab") {
      if (screen === "setup") {
        setFocused((prev) => (prev === "apikey" ? "location" : "apikey"))
      }
    }
    if (key.name === "?" || key.name === "h") {
      if (screen === "main") setScreen("help")
    }
    if (key.name === "escape") {
      if (screen === "help") setScreen("main")
    }
  })

  const handleSetup = useCallback(async () => {
    if (apiKey.trim()) {
      // Save config
      const configDir = `${process.env.HOME}/.sora-tui`
      await Bun.write(`${configDir}/config.json`, JSON.stringify({ apiKey, saveLocation }))
      
      // Create videos directory
      await Bun.$`mkdir -p ${saveLocation}`.quiet()
      
      setScreen("main")
    }
  }, [apiKey, saveLocation])

  const handleCreateVideo = useCallback(async () => {
    if (!prompt.trim() || status !== "idle") return

    try {
      setStatus("creating")
      setStatusMessage("Creating video...")
      setError("")

      const client = new OpenAI({ apiKey })

      // Create video
      const response: any = await client.post("/v1/videos", {
        body: { prompt: prompt.trim(), model: "sora-2" },
      })

      const videoId = response.id
      setStatusMessage(`Video ID: ${videoId}`)
      setStatus("polling")

      // Poll for completion
      let attempts = 0
      while (attempts < 60) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const statusResponse: any = await client.get(`/v1/videos/${videoId}`)
        setStatusMessage(`Status: ${statusResponse.status}`)

        if (statusResponse.status === "completed") {
          setStatus("downloading")
          setStatusMessage("Downloading...")

          const videoUrl = statusResponse.url
          const videoData = await fetch(videoUrl)
          const buffer = await videoData.arrayBuffer()
          
          const outputPath = `${saveLocation}/${videoId}.mp4`
          await Bun.write(outputPath, buffer)

          setStatus("completed")
          setStatusMessage(`✅ Saved to: ${outputPath}`)
          return
        } else if (statusResponse.status === "failed") {
          throw new Error(statusResponse.error || "Generation failed")
        }

        attempts++
      }

      throw new Error("Timeout waiting for video")
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "An error occurred")
      setStatusMessage("❌ Error")
    }
  }, [prompt, apiKey, saveLocation, status])

  // Check if we have config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configFile = await Bun.file(`${process.env.HOME}/.sora-tui/config.json`).text()
        const config = JSON.parse(configFile)
        if (config.apiKey) {
          setApiKey(config.apiKey)
          setSaveLocation(config.saveLocation || "./videos")
          setScreen("main")
        }
      } catch {
        // No config, stay on setup
      }
    }
    if (!apiKey) loadConfig()
  }, [])

  // Setup Screen
  if (screen === "setup") {
    return (
      <box style={{ padding: 2, flexDirection: "column" }}>
        <text
          content="🎬 Sora Video Generator - Setup"
          style={{ fg: "cyan", attributes: TextAttributes.BOLD }}
        />
        <text content="Welcome! Let's get you set up." style={{ marginTop: 1, fg: "gray" }} />

        <box style={{ marginTop: 2, flexDirection: "column" }}>
          <text content="OpenAI API Key:" style={{ attributes: TextAttributes.BOLD }} />
          <text content="Get your key from: platform.openai.com/api-keys" style={{ fg: "gray" }} />
          <box style={{ border: true, marginTop: 1, height: 3, width: 60 }}>
            <input
              placeholder="sk-..."
              onInput={setApiKey}
              focused={focused === "apikey"}
              onSubmit={handleSetup}
            />
          </box>

          <text content="Video Save Location:" style={{ marginTop: 2, attributes: TextAttributes.BOLD }} />
          <box style={{ border: true, marginTop: 1, height: 3, width: 60 }}>
            <input
              placeholder="./videos"
              onInput={setSaveLocation}
              focused={focused === "location"}
              onSubmit={handleSetup}
            />
          </box>

          <text
            content={apiKey.trim() ? "Press Enter to Start! →" : "Enter API Key to Continue"}
            style={{ marginTop: 2, fg: apiKey.trim() ? "green" : "yellow" }}
          />
        </box>

        <box style={{ marginTop: 2, border: true, padding: 1 }}>
          <text content="💡 Tip: Set OPENAI_API_KEY environment variable" style={{ fg: "yellow" }} />
        </box>
      </box>
    )
  }

  // Help Screen
  if (screen === "help") {
    return (
      <box style={{ padding: 2, flexDirection: "column" }}>
        <text content="🎬 Sora Video Generator - Help" style={{ fg: "cyan", attributes: TextAttributes.BOLD }} />

        <box style={{ marginTop: 2, border: true, padding: 1, flexDirection: "column" }}>
          <text content="🚀 Getting Started" style={{ fg: "blue", attributes: TextAttributes.BOLD }} />
          <text content="1. Get OpenAI API key from platform.openai.com" style={{ marginTop: 1 }} />
          <text content="2. Set OPENAI_API_KEY or enter in setup" />
          <text content="3. Start creating videos!" />
        </box>

        <box style={{ marginTop: 1, border: true, padding: 1, flexDirection: "column" }}>
          <text content="⌨️ Keyboard Shortcuts" style={{ fg: "cyan", attributes: TextAttributes.BOLD }} />
          <text content="? or h - Show help" style={{ marginTop: 1 }} />
          <text content="ESC - Back to main" />
          <text content="Tab - Switch focus" />
          <text content="Ctrl+C - Exit" />
        </box>

        <text content="Press ESC to go back" style={{ marginTop: 2, fg: "gray" }} />
      </box>
    )
  }

  // Main Screen
  return (
    <box style={{ padding: 2, flexDirection: "column" }}>
      <box style={{ justifyContent: "space-between" }}>
        <text content="🎬 Sora Video Generator" style={{ fg: "cyan", attributes: TextAttributes.BOLD }} />
        <text content="Press ? for help" style={{ fg: "gray" }} />
      </box>

      <box style={{ marginTop: 2, border: true, padding: 1, flexDirection: "column" }}>
        <text content="Video Prompt:" style={{ attributes: TextAttributes.BOLD }} />
        <box style={{ marginTop: 1, border: true, height: 5, width: 80 }}>
          <input
            placeholder="Describe your video..."
            onInput={setPrompt}
            onSubmit={handleCreateVideo}
            focused={true}
          />
        </box>

        <text
          content={status === "idle" && !prompt.trim() ? "Enter a prompt to continue" : "Press Enter to Create Video"}
          style={{ marginTop: 1, fg: prompt.trim() ? "green" : "yellow" }}
        />
      </box>

      {status !== "idle" && (
        <box style={{ marginTop: 2, border: true, padding: 1, flexDirection: "column" }}>
          <text content="Status:" style={{ attributes: TextAttributes.BOLD }} />
          <text
            content={statusMessage}
            style={{ marginTop: 1, fg: status === "completed" ? "green" : status === "error" ? "red" : "yellow" }}
          />
          {error && <text content={error} style={{ marginTop: 1, fg: "red" }} />}
        </box>
      )}

      <text content={`Save location: ${saveLocation}`} style={{ marginTop: 2, fg: "gray" }} />
    </box>
  )
}

render(<App />)

