# Whiteboard

Whiteboard is a website where users can draw anything on a virtual whiteboard!

- Join and create private rooms!
- Draw with three colors: black, red, and blue.
- Draw to your heart's desire!

![Draw](images/draw.gif)

## Creating a room

- Start server
- Go to localhost:2094/create
- Enter your username and click join

![Create](images/create.gif)

## Joining a room

- Got to localhost:2094/join
- Get room code from your friend
- Enter your username and room code
- Click join

![Join](images/join.gif)

## Stack

For the frontend, we are using the React Framework along with several libraries such as Konva and Materia UI.

For the backend, we are using Express.js along with Socket.io for realtime communication between different users.

Finally, we are using PostgreSQL to store data room information and line data.

![Diagram showing how each component in stack communicates](images/whiteboard-diagram.png)

## Database

![Database Schema](images/drawSQL-image-export-2026-02-08.png)

## Images

This project utilizes two Docker images: a Node.js base image for both the frontend and backend, and a PostgreSQL base image for the database.

### Backend
```
FROM node:22.13.1

WORKDIR /app
COPY package*.json .

RUN npm install
COPY . . 
EXPOSE 3000

CMD ["npm", "run", "start"]
```

### Frontend
```
FROM node:22.13.0

WORKDIR /app

ARG NODE_ENV
ARG VITE_SERVER_PORT

ENV NODE_ENV = ${NODE_ENV}
ENV VITE_SERVER_PORT=${VITE_SERVER_PORT}

COPY package*.json .

RUN npm install --legacy-peer-deps
COPY . . 
EXPOSE 2094
RUN npm run build

CMD ["npm", "run", "preview"]
```

## Networking

The PostgreSQL database server to every service in stack using DNS resolution by container name. 

The frontend and the backend are both exposed to the internet. SO, the frontend is communicate with the backend using HTTP requests and socket events.  