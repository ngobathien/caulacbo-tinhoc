# Website Cau Lac Bo (MERN)
## Description
Dự án này giúp quản lý câu lạc bộ tin học bao gồm lớp học, nhóm học, bài tập về nhà, đăng bài viết về vấn đề cần giải quyết thắc mắc bài tập, hỗ trợ hoặc các thành viên khác có thể bình luận để giúp đỡ 

## Table of contents

## Tech Stack
- NodeJS
- ExpressJS
- MongoDB
- Mongoose
- ReactJS
- Tailwind
- HTML

## Features

**User**  <br>
**Class**  <br>
**Group**  <br>
**Assignment**  <br>
**Post**  <br>
**Admin Features** <br>

## Setup and Installation
### Prerequisites
- Nodejs version:
- MongoDB

### Clone the project
```
git clone https://github.com/ngobathien/caulacbo-tinhoc.git
```

### Navigate to the project directory
```
cd caulacbo-tinhoc
```

### Install dependencies for frontend and backend
Install backend dependencies
```
cd backend
npm install
```

Install frontend dependencies
```
cd frontend
npm install
```

### Environment Variables
**Backend**
- Create a .env file in the backend directory.
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/your-database-name
or
# MONGODB_URI = mongodb+srv://name:password@cluster0.msmzm0k.mongodb.net/name-database?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN=7d

# EMAIL_USER="your-email@example.com"
# EMAIL_PASS="your-email-password"

BASE_URL=http://localhost:4000
API_URL=/api/v1

SUPABASE_URL=
SUPABASE_KEY=

```
**Frontend**
- Create a .env file in the frontend directory
```
VITE_API_URL=http://localhost:4000/api/v1
```

## Running Development Servers
### Backend
```
cd backend
npm run dev
or
npm start
```

### Frontend
```
cd backend
npm run dev
```

## API Endpoints <br>

- Auth
api/v1/auth/register <br>
api/v1/login <br>

- Post
GET api/v1/posts/ <br>
POST api/v1/posts/ <br>
PUT api/v1/posts/:id <br>
DELETE api/v1/posts/:id <br>

- Class
GET api/v1/classes/ <br>    
POST api/v1/classes/ <br>
PUT api/v1/classes/:id <br>
DELETE api/v1/posts/:id <br>

## 🚀 Deployment
Backend API live at: [https://itclub-api.onrender.com](https://itclub-api.onrender.com)
Facebook: [Facebook](facebook.com)

