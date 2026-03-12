FROM node:20

WORKDIR /app/web-implementation
# 最小限のExpressをインストール
RUN npm install express

COPY . .
EXPOSE 3000

CMD [ "node", "app.js" ]