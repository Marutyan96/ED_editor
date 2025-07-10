import asyncio
import subprocess
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class CCodeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("WebSocket connection accepted")

    async def disconnect(self, close_code):
        print("WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        code = data['code']

        # Сохраняем код во временный файл
        with open('/app/temp/temp.c', 'w') as f:  # Используем /app/temp из Dockerfile
            f.write(code)

        # Компиляция и выполнение
        try:
            compile_result = await asyncio.create_subprocess_exec(
                'gcc', '-o', '/app/temp/temp', '/app/temp/temp.c',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await compile_result.communicate()
            if compile_result.returncode == 0:
                run_result = await asyncio.create_subprocess_exec(
                    '/app/temp/temp',
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await run_result.communicate()
                await self.send(text_data=json.dumps({
                    'output': stdout.decode(),
                    'error': stderr.decode()
                }))
            else:
                await self.send(text_data=json.dumps({
                    'output': '',
                    'error': stderr.decode()
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'output': '',
                'error': str(e)
            }))
        finally:
            # Очистка временных файлов
            for file in ['/app/temp/temp.c', '/app/temp/temp']:
                try:
                    subprocess.run(['rm', '-f', file])
                except:
                    pass