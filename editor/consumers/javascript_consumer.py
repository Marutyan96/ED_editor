import json
import subprocess
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from pathlib import Path

class JSConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.process = None
        self.temp_file_path = None

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        # Гарантированно убиваем процесс при отключении
        if self.process:
            try:
                self.process.kill()
                await self.process.wait()
            except ProcessLookupError:
                pass
        
        # Удаляем временный файл, если он существует
        if self.temp_file_path and os.path.exists(self.temp_file_path):
            os.unlink(self.temp_file_path)

    async def cleanup(self):
        """Очистка ресурсов"""
        if self.process:
            try:
                self.process.kill()
                await self.process.wait()
            except ProcessLookupError:
                pass
            self.process = None
        
        if self.temp_file_path and os.path.exists(self.temp_file_path):
            os.unlink(self.temp_file_path)
            self.temp_file_path = None

    async def execute_js(self, code):
        await self.cleanup()  # Очищаем предыдущие ресурсы

        try:
            # Создаем временный файл в безопасном каталоге
            with tempfile.NamedTemporaryFile(
                suffix='.js',
                mode='w',
                encoding='utf-8',
                delete=False
            ) as tmp:
                # Добавляем обертки для перехвата console.log
                wrapped_code = f"""
                const originalConsoleLog = console.log;
                console.log = (...args) => {{
                    process.stdout.write(args.map(String).join(' ') + '\\n');
                }};
                {code}
                """
                tmp.write(wrapped_code)
                self.temp_file_path = tmp.name

            # Запускаем процесс с таймаутом
            self.process = await asyncio.create_subprocess_exec(
                'node',
                self.temp_file_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                limit=1024 * 1024  # 1MB буфер
            )

            # Читаем вывод с таймаутом
            try:
                stdout, stderr = await asyncio.wait_for(
                    self.process.communicate(),
                    timeout=10  # 10 секунд на выполнение
                )
            except asyncio.TimeoutError:
                await self.send(json.dumps({
                    'type': 'error',
                    'data': 'Timeout: Execution took too long'
                }))
                return

            # Отправляем результат
            if stderr:
                await self.send(json.dumps({
                    'type': 'error',
                    'data': stderr.decode('utf-8').strip()
                }))
            if stdout:
                await self.send(json.dumps({
                    'type': 'output',
                    'data': stdout.decode('utf-8').strip()
                }))

        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'data': f'Execution error: {str(e)}'
            }))
        finally:
            await self.cleanup()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data['type'] == 'execute_code':
                if not data.get('code'):
                    raise ValueError("Empty code")
                await self.execute_js(data['code'])
        except json.JSONDecodeError:
            await self.send(json.dumps({
                'type': 'error',
                'data': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'data': f'Request error: {str(e)}'
            }))