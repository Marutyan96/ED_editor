import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .python_executor import PythonExecutor

class PythonConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.executor = None

    async def connect(self):
        await self.accept()
        self.executor = PythonExecutor(self)

    async def disconnect(self, close_code):
        if self.executor:
            self.executor.active = False
            await self.executor.input_queue.put("")

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data['type'] == 'user_input':
            await self.executor.input_queue.put(data['value'])
        elif data['type'] == 'execute_code':
            await self.executor.execute(data['code'])