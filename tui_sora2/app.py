"""
Textual TUI application for creating videos via Sora2 API.
"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, Button, RichLog
import time

from .api import Sora2Client


class VideoCreatorApp(App):
    """A Textual-based TUI for video creation."""
    
    BINDINGS = [
        ("ctrl+c", "quit_confirm", "Quit (press twice)"),
    ]

    def __init__(self, client: Sora2Client) -> None:
        super().__init__()
        self.client = client
        self.video_id = None
        self.ctrl_c_last_time = 0

    def compose(self) -> ComposeResult:
        yield Header()
        yield Input(placeholder="Enter video script", id="script_input")
        yield Input(placeholder="Voice (optional)", id="voice_input")
        yield Input(placeholder="Style (optional)", id="style_input")
        yield Button("Create Video", id="create_button")
        yield RichLog(id="log")  # For status updates
        yield Footer()
    
    def action_quit_confirm(self) -> None:
        """Handle Ctrl-C press - quit on second press within 2 seconds."""
        current_time = time.time()
        if current_time - self.ctrl_c_last_time < 2:
            # Second Ctrl-C within 2 seconds - quit
            self.exit()
        else:
            # First Ctrl-C - show message and reset counter
            log = self.query_one(RichLog)
            log.write("Press Ctrl-C again to exit")
            self.ctrl_c_last_time = current_time

    async def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id != "create_button":
            return
        script = self.query_one("#script_input", Input).value
        voice = self.query_one("#voice_input", Input).value or None
        style = self.query_one("#style_input", Input).value or None
        log = self.query_one(RichLog)
        log.write("Creating video...")
        try:
            result = self.client.create_video(script, voice=voice, style=style)
            self.video_id = result.get("id")
            log.write(f"Video created with ID: {self.video_id}")
        except Exception as e:
            log.write(f"Error creating video: {e}")
            return
        await self.poll_status(log)

    async def poll_status(self, log: RichLog) -> None:
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