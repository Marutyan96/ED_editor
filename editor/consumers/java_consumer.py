import json
import os
import subprocess
import uuid
import shutil
import re
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

class JavaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Получено сообщение: {data}")
        if data['type'] == 'execute':
            code = data['code']
            message_id = data['messageId']
            result = await self.execute_java_code(code)
            response = {'messageId': message_id, 'message': result}
            print(f"Отправляем ответ: {response}")
            await self.send(text_data=json.dumps(response))

    async def execute_java_code(self, code):
        base_tmp_dir = settings.JAVA_TMP_DIR or '/tmp/java'
        execution_id = str(uuid.uuid4())
        tmp_dir = os.path.join(base_tmp_dir, execution_id)
        
        try:
            # Определяем имя главного класса
            class_name = self.detect_main_class(code)
            if not class_name:
                return "Ошибка: Не найден класс с методом main()"
            
            java_file = os.path.join(tmp_dir, f"{class_name}.java")
            print(f"Создаём папку: {tmp_dir}")
            os.makedirs(tmp_dir, exist_ok=True)
            
            print(f"Записываем код в: {java_file}")
            with open(java_file, 'w') as f:
                f.write(code)

            # Компилируем код
            print(f"Команда компиляции: javac {java_file}")
            compile_process = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
                cwd=tmp_dir
            )
            
            print(f"Код возврата компиляции: {compile_process.returncode}")
            if compile_process.returncode != 0:
                error_msg = compile_process.stderr or compile_process.stdout
                return f"Ошибка компиляции:\n{error_msg}"

            # Запускаем программу
            print(f"Запускаем: java -cp {tmp_dir} {class_name}")
            run_process = subprocess.run(
                ["java", "-cp", tmp_dir, class_name],
                capture_output=True,
                text=True
            )
            
            print(f"Вывод запуска: {run_process.stdout}")
            if run_process.returncode != 0:
                error_msg = run_process.stderr or run_process.stdout
                return f"Ошибка выполнения:\n{error_msg}"

            return run_process.stdout or "Программа выполнена без вывода"

        except Exception as e:
            print(f"Исключение: {str(e)}")
            return f"Ошибка: {str(e)}"

        finally:
            print(f"Удаляем: {tmp_dir}")
            if os.path.exists(tmp_dir):
                shutil.rmtree(tmp_dir, ignore_errors=True)

    def detect_main_class(self, code):
        """
        Определяет имя класса, содержащего метод main()
        """
        # Ищем public класс с методом main
        class_pattern = r'public\s+class\s+(\w+)\s*{[^}]*public\s+static\s+void\s+main\s*\([^)]*\)'
        match = re.search(class_pattern, code, re.DOTALL)
        if match:
            return match.group(1)
        
        # Если public класс не найден, ищем любой класс с методом main
        class_pattern = r'class\s+(\w+)\s*{[^}]*public\s+static\s+void\s+main\s*\([^)]*\)'
        match = re.search(class_pattern, code, re.DOTALL)
        if match:
            return match.group(1)
        
        return None