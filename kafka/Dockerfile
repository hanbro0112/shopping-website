# 建立 image 並在 dockerpose 開啟 consumer 
# 複製上層目錄的檔案，需從根目錄執行命令
# docker build -t my-consumer-app -f ./kafka/Dockerfile .
FROM node:20.11.1

WORKDIR /app
# 複製消費者檔案
COPY ./kafka/consumer.js /app/kafka/consumer.js
# 複製設定檔到外層以取用模組
COPY ./kafka/package.json /app/package.json
# 複製連線設定
COPY config /app/config
# 複製資料庫設定
COPY models /app/models
# 複製設定檔
COPY .env /app/.env
# 安裝相依套件
RUN npm install

EXPOSE 80
CMD ["node", "kafka/consumer.js"]