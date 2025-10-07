# 🎬 Sora Video Generator TUI

A beautiful terminal user interface for creating videos with OpenAI's Sora API, built with [OpenTUI](https://github.com/sst/opentui).

## ✨ Features

- 🎨 Beautiful, modern terminal UI powered by OpenTUI
- 🚀 Easy first-run setup flow
- 🔑 Secure API key management  
- 📁 Configurable save location
- 📊 Real-time progress tracking
- 💾 Automatic video downloads
- ❓ Built-in help system
- ⌨️ Keyboard shortcuts

## 📋 Prerequisites

- [Bun](https://bun.sh) runtime
- OpenAI API key with Sora access
- Verified OpenAI organization

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Your API Key (Optional)

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Or enter it during first-run setup.

### 3. Run the App

```bash
bun start
```

## 🎯 Usage

### First-Run Setup

1. Enter your OpenAI API key
2. Choose where to save videos (default: `./videos`)
3. Press Enter to start

### Creating Videos

1. Enter a descriptive prompt
2. Press Enter to generate
3. Wait for completion (status updates in real-time)
4. Video saves automatically to your chosen location

### Writing Great Prompts

Be specific and descriptive:
- ✅ "A serene sunset over mountains with warm orange tones, cinematic wide shot"
- ❌ "sunset"

### Keyboard Shortcuts

- `?` or `h` - Show help screen
- `ESC` - Back to main (from help)
- `Tab` - Switch focus between fields
- `Ctrl+C` - Exit application

## 🔑 API Key Setup

### Option 1: Environment Variable (Recommended)

```bash
# Add to your ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish
export OPENAI_API_KEY="sk-your-key-here"
```

### Option 2: First-Run Setup

Enter your API key when prompted during first launch. It will be saved to `~/.sora-tui/config.json`.

### Getting an API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and save it securely

## ⚠️ Organization Verification

Your OpenAI organization must be verified to use Sora:

1. Visit [platform.openai.com/settings/organization/general](https://platform.openai.com/settings/organization/general)
2. Click "Verify Organization"
3. Wait up to 15 minutes for access to propagate

## 📁 File Locations

- **Config**: `~/.sora-tui/config.json`
- **Videos**: `./videos/` (or your custom location)

## 🐛 Troubleshooting

### "Organization must be verified" Error

Your organization needs verification. See the Organization Verification section above.

### "Invalid API key" Error

- Check that your API key is correct
- Ensure `OPENAI_API_KEY` is set or entered in setup

### Videos Not Downloading

- Check that the save location exists and is writable
- Verify you have enough disk space
- Ensure video generation completed successfully

## 🔄 Development

```bash
# Run with auto-reload
bun run dev

# Run normally
bun start
```

## 🏗️ Built With

- [OpenTUI](https://github.com/sst/opentui) - Terminal UI framework
- [Bun](https://bun.sh) - JavaScript runtime
- [OpenAI](https://openai.com) - Sora API
- [React](https://react.dev) - UI library

## 📄 License

MIT

## 🔗 Links

- [OpenAI Platform](https://platform.openai.com)
- [Sora Documentation](https://platform.openai.com/docs/api-reference/videos)
- [OpenTUI](https://github.com/sst/opentui)

---

Made with ❤️ using [OpenTUI](https://github.com/sst/opentui)
