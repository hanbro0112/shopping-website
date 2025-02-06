# 建立 image 並在 dockerpose 開啟多個 container 
# docker build -t my-web-app .
FROM node:20.11.1

WORKDIR /app
# 複製當前檔案
COPY . /app
# 安裝相依套件
RUN npm install

EXPOSE 80
CMD ["npm", "start"]