#!/usr/bin/env python3
"""
Entry point for the TUI Sora2 Video Creator application.
"""
import os
import sys

from tui_sora2.api import Sora2Client
from tui_sora2.app import VideoCreatorApp


def main():
    # Use the global OpenAI API key for Sora2 requests
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: Please set the OPENAI_API_KEY environment variable.")
        sys.exit(1)
    client = Sora2Client(api_key=api_key)
    app = VideoCreatorApp(client)
    app.run()


if __name__ == "__main__":
    main()