"""
Sora2 API client module
"""
import requests
import logging

# Set up logging to file
logging.basicConfig(
    filename='sora_api.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


class Sora2Client:
    def __init__(self, api_key: str, endpoint: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.endpoint = endpoint

    def create_video(self, script: str, voice: str = None, style: str = None) -> dict:
        """Create a new video with the given parameters."""
        payload = {"prompt": script, "model": "sora-2"}
        if voice:
            payload["voice"] = voice
        if style:
            payload["style"] = style
        
        logging.info(f"Creating video with payload: {payload}")
        logging.info(f"Endpoint: {self.endpoint}/videos")
        
        response = requests.post(
            f"{self.endpoint}/videos",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
        )
        
        logging.info(f"Response status: {response.status_code}")
        logging.info(f"Response body: {response.text}")
        
        if response.status_code != 200:
            logging.error(f"API Error Response: {response.status_code}")
            logging.error(f"Response Body: {response.text}")
        
        response.raise_for_status()
        return response.json()

    def get_video_status(self, video_id: str) -> dict:
        """Retrieve status for a created video."""
        response = requests.get(
            f"{self.endpoint}/videos/{video_id}",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
        )
        response.raise_for_status()
        return response.json()

    def download_video(self, video_id: str, output_path: str) -> None:
        """Download the completed video to the specified path."""
        info = self.get_video_status(video_id)
        if info.get("status") != "completed":
            raise RuntimeError(
                f"Video {video_id} not completed (status: {info.get('status')})"
            )
        download_url = info.get("download_url")
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(output_path, "wb") as fw:
                for chunk in r.iter_content(chunk_size=8192):
                    fw.write(chunk)