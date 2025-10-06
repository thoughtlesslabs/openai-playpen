"""
Textual TUI application for creating videos via Sora2 API.
"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, Button, TextLog

from .api import Sora2Client


class VideoCreatorApp(App):
    """A Textual-based TUI for video creation."""

    def __init__(self, client: Sora2Client) -> None:
        super().__init__()
        self.client = client
        self.video_id = None

    def compose(self) -> ComposeResult:
        yield Header()
        yield Input(placeholder="Enter video script", id="script_input")
        yield Input(placeholder="Voice (optional)", id="voice_input")
        yield Input(placeholder="Style (optional)", id="style_input")
        yield Button("Create Video", id="create_button")
        yield TextLog(id="log")  # For status updates
        yield Footer()

    async def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id != "create_button":
            return
        script = self.query_one("#script_input", Input).value
        voice = self.query_one("#voice_input", Input).value or None
        style = self.query_one("#style_input", Input).value or None
        log = self.query_one(TextLog)
        log.write("Creating video...")
        try:
            result = self.client.create_video(script, voice=voice, style=style)
            self.video_id = result.get("id")
            log.write(f"Video created with ID: {self.video_id}")
        except Exception as e:
            log.write(f"Error creating video: {e}")
            return
        await self.poll_status(log)

    async def poll_status(self, log: TextLog) -> None:
        """Poll the video status until completion and download it."""
        import asyncio

        while True:
            try:
                info = self.client.get_video_status(self.video_id)
                status = info.get("status")
                log.write(f"Status: {status}")
                if status == "completed":
                    break
            except Exception as e:
                log.write(f"Error checking status: {e}")
                return
            await asyncio.sleep(2)
        output_file = f"{self.video_id}.mp4"
        log.write(f"Downloading video to {output_file}...")
        try:
            self.client.download_video(self.video_id, output_file)
            log.write(f"Video downloaded to {output_file}")
        except Exception as e:
            log.write(f"Error downloading video: {e}")