from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid

app = FastAPI(title="ARC Project Management System", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.arc_project_management

# Security
SECRET_KEY = os.environ.get("SECRET_KEY", "arc-secret-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "worker"  # ceo, finance, operations, worker
    department: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    stats: Optional[dict] = None

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    project_type: str = "General"  # Insurance, Banking, Pension, etc.
    contract_value: float = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_users: List[str] = []
    finance_officer: Optional[str] = None
    operations_officer: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: str
    assigned_to: Optional[str] = None
    priority: str = "medium"  # low, medium, high, urgent
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # todo, in_progress, review, done
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    actual_hours: Optional[float] = None

class CommentCreate(BaseModel):
    task_id: str
    content: str

class ActivityLog(BaseModel):
    user_id: str
    action: str
    entity_type: str  # task, project, comment
    entity_id: str
    details: Optional[dict] = None

# ==================== AUTH HELPERS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== INITIALIZATION ====================

@app.on_event("startup")
async def startup_db_client():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.projects.create_index("id", unique=True)
    await db.tasks.create_index("id", unique=True)
    await db.tasks.create_index("project_id")
    await db.tasks.create_index("assigned_to")
    await db.comments.create_index("task_id")
    await db.activities.create_index([("created_at", -1)])
    
    # Create default CEO if not exists
    existing_ceo = await db.users.find_one({"email": "sadi@arc.com"})
    if not existing_ceo:
        ceo_user = {
            "id": str(uuid.uuid4()),
            "email": "sadi@arc.com",
            "password": get_password_hash("12345678"),
            "name": "CEO - Sadi",
            "role": "ceo",
            "department": "Executive",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "avatar": f"https://ui-avatars.com/api/?name=CEO+Sadi&background=C0181F&color=fff"
        }
        await db.users.insert_one(ceo_user)
        print("Default CEO created: sadi@arc.com / 12345678")
    
    # Create finance officer
    existing_finance = await db.users.find_one({"email": "maureen.bangu@ar-consurt-world.com"})
    if not existing_finance:
        finance_user = {
            "id": str(uuid.uuid4()),
            "email": "maureen.bangu@ar-consurt-world.com",
            "password": get_password_hash("12345678"),
            "name": "Maureen Bangu",
            "role": "finance",
            "department": "Finance",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "avatar": f"https://ui-avatars.com/api/?name=Maureen+Bangu&background=B8862B&color=fff"
        }
        await db.users.insert_one(finance_user)
        print("Finance officer created")
    
    # Create operations officer
    existing_ops = await db.users.find_one({"email": "juma.h.kasele@gmail.com"})
    if not existing_ops:
        ops_user = {
            "id": str(uuid.uuid4()),
            "email": "juma.h.kasele@gmail.com",
            "password": get_password_hash("11223344"),
            "name": "Juma H. Kasele",
            "role": "operations",
            "department": "Operations & Quality",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "avatar": f"https://ui-avatars.com/api/?name=Juma+Kasele&background=03624C&color=fff"
        }
        await db.users.insert_one(ops_user)
        print("Operations officer created")

# ==================== API ROUTES ====================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ARC Project Management", "version": "2.0.0"}

# ==================== AUTH ROUTES ====================

@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "department": user_data.department,
        "phone": user_data.phone,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "avatar": f"https://ui-avatars.com/api/?name={user_data.name.replace(' ', '+')}&background=B8862B&color=fff"
    }
    await db.users.insert_one(user)
    
    token = create_access_token({"sub": user_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    token = create_access_token({"sub": user["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "department": user.get("department"),
            "avatar": user.get("avatar")
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    # Get user stats
    total_tasks = await db.tasks.count_documents({"assigned_to": current_user["id"]})
    completed_tasks = await db.tasks.count_documents({"assigned_to": current_user["id"], "status": "done"})
    
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "department": current_user.get("department"),
        "phone": current_user.get("phone"),
        "avatar": current_user.get("avatar"),
        "is_active": current_user.get("is_active", True),
        "created_at": current_user.get("created_at"),
        "stats": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        }
    }

# ==================== USER ROUTES ====================

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    users = []
    async for user in db.users.find({}):
        total_tasks = await db.tasks.count_documents({"assigned_to": user["id"]})
        completed_tasks = await db.tasks.count_documents({"assigned_to": user["id"], "status": "done"})
        in_progress = await db.tasks.count_documents({"assigned_to": user["id"], "status": "in_progress"})
        
        users.append({
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "department": user.get("department"),
            "avatar": user.get("avatar"),
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at"),
            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "in_progress": in_progress,
                "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
            }
        })
    return users

@app.post("/api/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["ceo", "operations"]:
        raise HTTPException(status_code=403, detail="Only CEO and Operations can create users")
    
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "department": user_data.department,
        "phone": user_data.phone,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "avatar": f"https://ui-avatars.com/api/?name={user_data.name.replace(' ', '+')}&background=B8862B&color=fff"
    }
    await db.users.insert_one(user)
    
    return {"id": user_id, "message": "User created successfully"}

@app.put("/api/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ceo":
        raise HTTPException(status_code=403, detail="Only CEO can modify user status")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_active", True)
    await db.users.update_one({"id": user_id}, {"$set": {"is_active": new_status}})
    return {"id": user_id, "is_active": new_status}

# ==================== PROJECT ROUTES ====================

@app.get("/api/projects")
async def get_projects(current_user: dict = Depends(get_current_user)):
    projects = []
    async for project in db.projects.find({}).sort("created_at", -1):
        # Get task stats
        total_tasks = await db.tasks.count_documents({"project_id": project["id"]})
        completed_tasks = await db.tasks.count_documents({"project_id": project["id"], "status": "done"})
        
        # Get assigned users info
        assigned_users = []
        for user_id in project.get("assigned_users", []):
            user = await db.users.find_one({"id": user_id})
            if user:
                assigned_users.append({
                    "id": user["id"],
                    "name": user["name"],
                    "avatar": user.get("avatar")
                })
        
        project["_id"] = str(project["_id"])
        project["assigned_users_info"] = assigned_users
        project["task_stats"] = {
            "total": total_tasks,
            "completed": completed_tasks,
            "progress": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        }
        projects.append(project)
    return projects

@app.post("/api/projects")
async def create_project(project_data: ProjectCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["ceo", "finance", "operations"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Generate project number
    year = datetime.now().year
    count = await db.projects.count_documents({}) + 1
    project_number = f"ARC-{year}-{str(count).zfill(4)}"
    
    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "project_number": project_number,
        "name": project_data.name,
        "description": project_data.description,
        "client_name": project_data.client_name,
        "project_type": project_data.project_type,
        "contract_value": project_data.contract_value,
        "start_date": project_data.start_date,
        "end_date": project_data.end_date,
        "assigned_users": project_data.assigned_users,
        "finance_officer": project_data.finance_officer,
        "operations_officer": project_data.operations_officer,
        "status": "active",
        "created_by": current_user["id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.projects.insert_one(project)
    
    # Log activity
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "created_project",
        "entity_type": "project",
        "entity_id": project_id,
        "entity_name": project_data.name,
        "created_at": datetime.utcnow()
    })
    
    return {"id": project_id, "project_number": project_number, "message": "Project created successfully"}

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["_id"] = str(project["_id"])
    return project

@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updates["updated_at"] = datetime.utcnow()
    await db.projects.update_one({"id": project_id}, {"$set": updates})
    return {"message": "Project updated successfully"}

# ==================== TASK ROUTES ====================

@app.get("/api/tasks")
async def get_tasks(
    project_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if assigned_to:
        query["assigned_to"] = assigned_to
    if status:
        query["status"] = status
    
    tasks = []
    async for task in db.tasks.find(query).sort("created_at", -1):
        task["_id"] = str(task["_id"])
        
        # Get assigned user info
        if task.get("assigned_to"):
            user = await db.users.find_one({"id": task["assigned_to"]})
            if user:
                task["assigned_user"] = {
                    "id": user["id"],
                    "name": user["name"],
                    "avatar": user.get("avatar")
                }
        
        # Get project info
        project = await db.projects.find_one({"id": task["project_id"]})
        if project:
            task["project_name"] = project["name"]
        
        # Get comment count
        task["comment_count"] = await db.comments.count_documents({"task_id": task["id"]})
        
        tasks.append(task)
    return tasks

@app.post("/api/tasks")
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    # Verify project exists
    project = await db.projects.find_one({"id": task_data.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "title": task_data.title,
        "description": task_data.description,
        "project_id": task_data.project_id,
        "assigned_to": task_data.assigned_to,
        "priority": task_data.priority,
        "status": "todo",
        "due_date": task_data.due_date,
        "estimated_hours": task_data.estimated_hours,
        "actual_hours": 0,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.tasks.insert_one(task)
    
    # Log activity
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "created_task",
        "entity_type": "task",
        "entity_id": task_id,
        "entity_name": task_data.title,
        "project_id": task_data.project_id,
        "created_at": datetime.utcnow()
    })
    
    return {"id": task_id, "message": "Task created successfully"}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Track status change
    old_status = task.get("status")
    new_status = update_data.get("status")
    
    if new_status == "done" and old_status != "done":
        update_data["completed_at"] = datetime.utcnow()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    
    # Log activity
    action = "updated_task"
    if new_status and new_status != old_status:
        action = f"moved_task_to_{new_status}"
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": action,
        "entity_type": "task",
        "entity_id": task_id,
        "entity_name": task["title"],
        "project_id": task["project_id"],
        "details": {"old_status": old_status, "new_status": new_status} if new_status else None,
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Task updated successfully"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.delete_one({"id": task_id})
    await db.comments.delete_many({"task_id": task_id})
    
    return {"message": "Task deleted successfully"}

# ==================== COMMENT ROUTES ====================

@app.get("/api/tasks/{task_id}/comments")
async def get_comments(task_id: str, current_user: dict = Depends(get_current_user)):
    comments = []
    async for comment in db.comments.find({"task_id": task_id}).sort("created_at", 1):
        comment["_id"] = str(comment["_id"])
        user = await db.users.find_one({"id": comment["user_id"]})
        if user:
            comment["user"] = {
                "id": user["id"],
                "name": user["name"],
                "avatar": user.get("avatar")
            }
        comments.append(comment)
    return comments

@app.post("/api/tasks/{task_id}/comments")
async def add_comment(task_id: str, comment_data: CommentCreate, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment_id = str(uuid.uuid4())
    comment = {
        "id": comment_id,
        "task_id": task_id,
        "user_id": current_user["id"],
        "content": comment_data.content,
        "created_at": datetime.utcnow()
    }
    await db.comments.insert_one(comment)
    
    # Log activity
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "commented_on_task",
        "entity_type": "comment",
        "entity_id": comment_id,
        "entity_name": task["title"],
        "project_id": task["project_id"],
        "created_at": datetime.utcnow()
    })
    
    return {"id": comment_id, "message": "Comment added successfully"}

# ==================== ACTIVITY/DASHBOARD ROUTES ====================

@app.get("/api/activities")
async def get_activities(
    limit: int = 50,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if project_id:
        query["project_id"] = project_id
    
    activities = []
    async for activity in db.activities.find(query).sort("created_at", -1).limit(limit):
        activity["_id"] = str(activity["_id"])
        activities.append(activity)
    return activities

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Overall stats
    total_projects = await db.projects.count_documents({"status": "active"})
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"status": "done"})
    in_progress_tasks = await db.tasks.count_documents({"status": "in_progress"})
    overdue_tasks = await db.tasks.count_documents({
        "due_date": {"$lt": datetime.utcnow()},
        "status": {"$ne": "done"}
    })
    total_users = await db.users.count_documents({"is_active": True})
    
    # User's personal stats
    my_tasks = await db.tasks.count_documents({"assigned_to": current_user["id"]})
    my_completed = await db.tasks.count_documents({"assigned_to": current_user["id"], "status": "done"})
    my_in_progress = await db.tasks.count_documents({"assigned_to": current_user["id"], "status": "in_progress"})
    
    # Tasks by priority
    urgent_tasks = await db.tasks.count_documents({"priority": "urgent", "status": {"$ne": "done"}})
    high_tasks = await db.tasks.count_documents({"priority": "high", "status": {"$ne": "done"}})
    
    return {
        "overview": {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "overdue_tasks": overdue_tasks,
            "total_users": total_users,
            "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        },
        "my_stats": {
            "total_tasks": my_tasks,
            "completed": my_completed,
            "in_progress": my_in_progress,
            "completion_rate": round((my_completed / my_tasks * 100) if my_tasks > 0 else 0, 1)
        },
        "priority_breakdown": {
            "urgent": urgent_tasks,
            "high": high_tasks
        }
    }

@app.get("/api/dashboard/my-tasks")
async def get_my_tasks(current_user: dict = Depends(get_current_user)):
    tasks = []
    async for task in db.tasks.find({"assigned_to": current_user["id"], "status": {"$ne": "done"}}).sort("due_date", 1):
        task["_id"] = str(task["_id"])
        project = await db.projects.find_one({"id": task["project_id"]})
        if project:
            task["project_name"] = project["name"]
        tasks.append(task)
    return tasks

@app.get("/api/dashboard/team-performance")
async def get_team_performance(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["ceo", "operations"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    team_stats = []
    async for user in db.users.find({"is_active": True}):
        total = await db.tasks.count_documents({"assigned_to": user["id"]})
        completed = await db.tasks.count_documents({"assigned_to": user["id"], "status": "done"})
        in_progress = await db.tasks.count_documents({"assigned_to": user["id"], "status": "in_progress"})
        overdue = await db.tasks.count_documents({
            "assigned_to": user["id"],
            "due_date": {"$lt": datetime.utcnow()},
            "status": {"$ne": "done"}
        })
        
        team_stats.append({
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user.get("avatar"),
            "total_tasks": total,
            "completed": completed,
            "in_progress": in_progress,
            "overdue": overdue,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)
        })
    
    return sorted(team_stats, key=lambda x: x["completion_rate"], reverse=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
