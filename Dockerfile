FROM nginx:1.28-alpine

LABEL maintainer="vapostol"
LABEL description="Zone01 GraphQL Profile - static site"

COPY public/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
