FROM node:20-alpine

WORKDIR /app

# نسخ ملفات الـ package
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات
COPY . .

# تشغيل الـ Dev Server
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
