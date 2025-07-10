# code_editor/editor/consumers/php_consumer.py
import json
import subprocess
from channels.generic.websocket import AsyncWebsocketConsumer
import tempfile
import os

class PhpConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            code = data.get('code', '')
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(suffix='.php', delete=False) as tmp:
                tmp.write(code.encode('utf-8'))
                tmp_path = tmp.name
            
            try:
                process = subprocess.run(
                    ['php', tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                await self.send(text_data=json.dumps({
                    'output': process.stdout,
                    'error': process.stderr if process.returncode != 0 else None
                }))
            finally:
                # Clean up the temporary file
                os.unlink(tmp_path)
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f'Execution error: {str(e)}'
            }))