FROM node:alpine as builder 
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN npm run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]