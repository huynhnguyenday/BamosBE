# Sử dụng Node.js phiên bản LTS
FROM node:18-alpine 

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Mở cổng chạy ứng dụng (thay bằng port bạn đang sử dụng nếu cần)
EXPOSE 3000 

# Chạy ứng dụng
CMD ["npm", "start"]
