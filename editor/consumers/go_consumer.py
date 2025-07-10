# consumers/go_consumer.py

import json
import subprocess
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer

class GoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        code = data['code']
        
        # Create a temporary file in the Go temp directory
        with tempfile.NamedTemporaryFile(suffix='.go', dir='/tmp/go_temp', delete=False) as tmp:
            tmp.write(code.encode('utf-8'))
            tmp_path = tmp.name
        
        try:
            # Set GOPATH and run the code
            env = os.environ.copy()
            env['GOPATH'] = '/tmp/go_temp'
            
            process = subprocess.run(
                ['go', 'run', tmp_path],
                capture_output=True,
                text=True,
                timeout=10,
                env=env
            )
            
            output = process.stdout
            error = process.stderr
            
            await self.send(text_data=json.dumps({
                'output': output,
                'error': error
            }))
            
        except subprocess.TimeoutExpired:
            await self.send(text_data=json.dumps({
                'error': 'Execution time exceeded (10 seconds)'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))
        finally:
            # Delete the temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
