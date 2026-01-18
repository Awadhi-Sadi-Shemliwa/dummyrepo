from fastapi import FastAPI, HTTPException, Depends, status
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

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RoleAssignment(BaseModel):
    user_id: str
    new_role: str

# Contract creation by CEO
class ContractCreate(BaseModel):
    client_name: str
    project_name: str
    project_type: str = "General"
    contract_value: float
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# Finance allocation
class FinanceAllocation(BaseModel):
    staff_count: int = 0
    tax: float = 0
    overhead_cost: float = 0
    commission: float = 0
    admin_fee: float = 0
    staff_cost: float = 0

# Operations setup
class OperationsSetup(BaseModel):
    project_start_date: Optional[str] = None
    project_end_date: Optional[str] = None
    duration_type: str = "Non-Recurring"
    manual_status: Optional[str] = None
    inactive_reason: Optional[str] = None

class StaffAssignment(BaseModel):
    user_id: str
    role_in_project: str
    payment_amount: float = 0

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    contract_id: str
    assigned_to: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class CommentCreate(BaseModel):
    task_id: str
    content: str

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

# ==================== PROFIT CALCULATIONS ====================

def calculate_profits(contract_value: float, staff_cost: float, commission: float, tax: float, admin_fee: float, overhead_cost: float):
    target_profit = 0.30 * contract_value
    actual_profit = contract_value - (staff_cost + commission + tax + admin_fee + overhead_cost)
    
    if actual_profit < 0:
        profit_status = "red"
    elif actual_profit < target_profit:
        profit_status = "orange"
    else:
        profit_status = "green"
    
    return target_profit, actual_profit, profit_status

def calculate_contract_status(start_date: str, end_date: str, manual_status: str = None):
    if manual_status == "inactive":
        return "Inactive"
    
    now = datetime.utcnow()
    
    if start_date and end_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if isinstance(start_date, str) else start_date
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if isinstance(end_date, str) else end_date
            
            if now > end:
                return "Expired"
            elif now >= start:
                return "Active"
        except:
            pass
    
    return "Pending"

# ==================== INITIALIZATION ====================

@app.on_event("startup")
async def startup_db_client():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.contracts.create_index("id", unique=True)
    await db.contracts.create_index("contract_number", unique=True)
    await db.tasks.create_index("id", unique=True)
    await db.tasks.create_index("contract_id")
    await db.comments.create_index("task_id")
    await db.activities.create_index([("created_at", -1)])
    
    # ONLY create default CEO - no other mock users
    existing_ceo = await db.users.find_one({"email": "ceo@arc.com"})
    if not existing_ceo:
        ceo_user = {
            "id": str(uuid.uuid4()),
            "email": "ceo@arc.com",
            "password": get_password_hash("admin123"),
            "name": "CEO Administrator",
            "role": "ceo",
            "department": "Executive",
            "is_active": True,
            "is_approved": True,
            "created_at": datetime.utcnow(),
            "avatar": f"https://ui-avatars.com/api/?name=CEO&background=B22222&color=fff&bold=true"
        }
        await db.users.insert_one(ceo_user)
        print("Default CEO created: ceo@arc.com / admin123")

# ==================== API ROUTES ====================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ARC Project Management", "version": "2.0.0"}

# ==================== AUTH ROUTES ====================

@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
    """Anyone can sign up - they become workers pending CEO approval"""
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "role": "worker",  # All signups start as workers
        "department": "Staff",
        "phone": user_data.phone,
        "is_active": True,
        "is_approved": True,  # Auto-approved, CEO can change roles later
        "created_at": datetime.utcnow(),
        "avatar": f"https://ui-avatars.com/api/?name={user_data.name.replace(' ', '+')}&background=3B82F6&color=fff"
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
        },
        "message": "Account created! You can now log in."
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact your administrator.")
    
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

# ==================== USER MANAGEMENT ====================

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
            "phone": user.get("phone"),
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

@app.put("/api/users/{user_id}/assign-role")
async def assign_role(user_id: str, assignment: RoleAssignment, current_user: dict = Depends(get_current_user)):
    """CEO assigns roles (Finance Officer, Operations Officer, or Worker)"""
    if current_user["role"] != "ceo":
        raise HTTPException(status_code=403, detail="Only CEO can assign roles")
    
    if assignment.new_role not in ["finance", "operations", "worker"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be finance, operations, or worker")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    avatar_colors = {"finance": "B8860B", "operations": "22C55E", "worker": "3B82F6"}
    new_avatar = f"https://ui-avatars.com/api/?name={user['name'].replace(' ', '+')}&background={avatar_colors[assignment.new_role]}&color=fff"
    
    await db.users.update_one({"id": user_id}, {"$set": {"role": assignment.new_role, "avatar": new_avatar}})
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": f"assigned {assignment.new_role} role to",
        "entity_type": "user",
        "entity_id": user_id,
        "entity_name": user["name"],
        "created_at": datetime.utcnow()
    })
    
    return {"id": user_id, "role": assignment.new_role, "message": f"User assigned as {assignment.new_role}"}

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

# ==================== CONTRACT ROUTES ====================

@app.get("/api/contracts")
async def get_contracts(current_user: dict = Depends(get_current_user)):
    contracts = []
    async for contract in db.contracts.find({}).sort("created_at", -1):
        contract["project_status"] = calculate_contract_status(
            contract.get("project_start_date"),
            contract.get("project_end_date"),
            contract.get("manual_status")
        )
        
        total_tasks = await db.tasks.count_documents({"contract_id": contract["id"]})
        completed_tasks = await db.tasks.count_documents({"contract_id": contract["id"], "status": "done"})
        
        contract["_id"] = str(contract["_id"])
        contract["task_stats"] = {
            "total": total_tasks,
            "completed": completed_tasks,
            "progress": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        }
        contracts.append(contract)
    return contracts

@app.post("/api/contracts")
async def create_contract(contract_data: ContractCreate, current_user: dict = Depends(get_current_user)):
    """CEO creates contracts with client details"""
    if current_user["role"] != "ceo":
        raise HTTPException(status_code=403, detail="Only CEO can create contracts")
    
    year = datetime.now().year
    count = await db.contracts.count_documents({}) + 1
    contract_number = f"ARC-{year}-{str(count).zfill(4)}"
    
    contract_id = str(uuid.uuid4())
    contract = {
        "id": contract_id,
        "contract_number": contract_number,
        "client_name": contract_data.client_name,
        "project_name": contract_data.project_name,
        "project_type": contract_data.project_type,
        "description": contract_data.description,
        "contract_value": contract_data.contract_value,
        "staff_count": 0,
        "tax": 0,
        "overhead_cost": 0,
        "commission": 0,
        "admin_fee": 0,
        "staff_cost": 0,
        "target_profit": contract_data.contract_value * 0.30,
        "actual_profit": contract_data.contract_value,
        "profit_status": "green",
        "project_status": "Pending",
        "project_start_date": contract_data.start_date,
        "project_end_date": contract_data.end_date,
        "duration_type": "Non-Recurring",
        "manual_status": None,
        "inactive_reason": None,
        "staff_list": [],
        "created_by": current_user["id"],
        "created_by_name": current_user["name"],
        "finance_allocated": False,
        "operations_configured": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.contracts.insert_one(contract)
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "created contract",
        "entity_type": "contract",
        "entity_id": contract_id,
        "entity_name": f"{contract_number} - {contract_data.client_name}",
        "created_at": datetime.utcnow()
    })
    
    return {"id": contract_id, "contract_number": contract_number, "message": "Contract created successfully"}

@app.put("/api/contracts/{contract_id}/finance")
async def allocate_finance(contract_id: str, finance_data: FinanceAllocation, current_user: dict = Depends(get_current_user)):
    """Finance Officer allocates costs"""
    if current_user["role"] not in ["ceo", "finance"]:
        raise HTTPException(status_code=403, detail="Only Finance Officer can allocate costs")
    
    contract = await db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    target_profit, actual_profit, profit_status = calculate_profits(
        contract["contract_value"],
        finance_data.staff_cost,
        finance_data.commission,
        finance_data.tax,
        finance_data.admin_fee,
        finance_data.overhead_cost
    )
    
    await db.contracts.update_one({"id": contract_id}, {"$set": {
        "staff_count": finance_data.staff_count,
        "tax": finance_data.tax,
        "overhead_cost": finance_data.overhead_cost,
        "commission": finance_data.commission,
        "admin_fee": finance_data.admin_fee,
        "staff_cost": finance_data.staff_cost,
        "target_profit": target_profit,
        "actual_profit": actual_profit,
        "profit_status": profit_status,
        "finance_allocated": True,
        "finance_officer_id": current_user["id"],
        "finance_officer_name": current_user["name"],
        "updated_at": datetime.utcnow()
    }})
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "allocated finances for",
        "entity_type": "contract",
        "entity_id": contract_id,
        "entity_name": contract["contract_number"],
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Finance allocation saved", "actual_profit": actual_profit, "profit_status": profit_status}

@app.put("/api/contracts/{contract_id}/operations")
async def update_operations(contract_id: str, ops_data: OperationsSetup, current_user: dict = Depends(get_current_user)):
    """Operations Officer configures project execution"""
    if current_user["role"] not in ["ceo", "operations"]:
        raise HTTPException(status_code=403, detail="Only Operations Officer can configure execution")
    
    contract = await db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    project_status = calculate_contract_status(
        ops_data.project_start_date,
        ops_data.project_end_date,
        ops_data.manual_status
    )
    
    await db.contracts.update_one({"id": contract_id}, {"$set": {
        "project_start_date": ops_data.project_start_date,
        "project_end_date": ops_data.project_end_date,
        "duration_type": ops_data.duration_type,
        "manual_status": ops_data.manual_status,
        "inactive_reason": ops_data.inactive_reason if ops_data.manual_status == "inactive" else None,
        "project_status": project_status,
        "operations_configured": True,
        "operations_officer_id": current_user["id"],
        "operations_officer_name": current_user["name"],
        "updated_at": datetime.utcnow()
    }})
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "configured operations for",
        "entity_type": "contract",
        "entity_id": contract_id,
        "entity_name": contract["contract_number"],
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Operations configuration saved", "project_status": project_status}

@app.post("/api/contracts/{contract_id}/assign-staff")
async def assign_staff_to_contract(contract_id: str, assignment: StaffAssignment, current_user: dict = Depends(get_current_user)):
    """Assign a worker to a contract"""
    if current_user["role"] not in ["ceo", "operations"]:
        raise HTTPException(status_code=403, detail="Only CEO or Operations can assign staff")
    
    contract = await db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    user = await db.users.find_one({"id": assignment.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    staff_entry = {
        "id": str(uuid.uuid4()),
        "user_id": assignment.user_id,
        "user_name": user["name"],
        "user_avatar": user.get("avatar"),
        "role_in_project": assignment.role_in_project,
        "payment_amount": assignment.payment_amount,
        "assigned_at": datetime.utcnow().isoformat()
    }
    
    await db.contracts.update_one({"id": contract_id}, {"$push": {"staff_list": staff_entry}})
    
    return {"message": "Staff assigned successfully", "staff": staff_entry}

# ==================== TASK ROUTES ====================

@app.get("/api/tasks")
async def get_tasks(contract_id: Optional[str] = None, assigned_to: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if contract_id:
        query["contract_id"] = contract_id
    if assigned_to:
        query["assigned_to"] = assigned_to
    if status:
        query["status"] = status
    
    tasks = []
    async for task in db.tasks.find(query).sort("created_at", -1):
        task["_id"] = str(task["_id"])
        
        if task.get("assigned_to"):
            user = await db.users.find_one({"id": task["assigned_to"]})
            if user:
                task["assigned_user"] = {"id": user["id"], "name": user["name"], "avatar": user.get("avatar")}
        
        contract = await db.contracts.find_one({"id": task["contract_id"]})
        if contract:
            task["contract_number"] = contract["contract_number"]
            task["project_name"] = contract.get("project_name")
        
        task["comment_count"] = await db.comments.count_documents({"task_id": task["id"]})
        tasks.append(task)
    return tasks

@app.post("/api/tasks")
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    contract = await db.contracts.find_one({"id": task_data.contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "title": task_data.title,
        "description": task_data.description,
        "contract_id": task_data.contract_id,
        "assigned_to": task_data.assigned_to,
        "priority": task_data.priority,
        "status": "todo",
        "due_date": task_data.due_date,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.tasks.insert_one(task)
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": "created task",
        "entity_type": "task",
        "entity_id": task_id,
        "entity_name": task_data.title,
        "contract_id": task_data.contract_id,
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
    
    old_status = task.get("status")
    new_status = update_data.get("status")
    
    if new_status == "done" and old_status != "done":
        update_data["completed_at"] = datetime.utcnow()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    
    action = "updated task"
    if new_status and new_status != old_status:
        action = f"moved task to {new_status}"
    
    await db.activities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": action,
        "entity_type": "task",
        "entity_id": task_id,
        "entity_name": task["title"],
        "contract_id": task["contract_id"],
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
            comment["user"] = {"id": user["id"], "name": user["name"], "avatar": user.get("avatar")}
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
    
    return {"id": comment_id, "message": "Comment added successfully"}

# ==================== DASHBOARD ROUTES ====================

@app.get("/api/activities")
async def get_activities(limit: int = 50, current_user: dict = Depends(get_current_user)):
    activities = []
    async for activity in db.activities.find({}).sort("created_at", -1).limit(limit):
        activity["_id"] = str(activity["_id"])
        activities.append(activity)
    return activities

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total_contracts = await db.contracts.count_documents({})
    active_contracts = await db.contracts.count_documents({"project_status": "Active"})
    pending_contracts = await db.contracts.count_documents({"project_status": "Pending"})
    
    pipeline = [{"$group": {"_id": None, "total_value": {"$sum": "$contract_value"}, "total_target_profit": {"$sum": "$target_profit"}, "total_actual_profit": {"$sum": "$actual_profit"}}}]
    financial = await db.contracts.aggregate(pipeline).to_list(1)
    financial_data = financial[0] if financial else {"total_value": 0, "total_target_profit": 0, "total_actual_profit": 0}
    
    green_count = await db.contracts.count_documents({"profit_status": "green"})
    orange_count = await db.contracts.count_documents({"profit_status": "orange"})
    red_count = await db.contracts.count_documents({"profit_status": "red"})
    
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"status": "done"})
    in_progress_tasks = await db.tasks.count_documents({"status": "in_progress"})
    overdue_tasks = await db.tasks.count_documents({"due_date": {"$lt": datetime.utcnow()}, "status": {"$ne": "done"}})
    
    total_users = await db.users.count_documents({"is_active": True})
    
    my_tasks = await db.tasks.count_documents({"assigned_to": current_user["id"]})
    my_completed = await db.tasks.count_documents({"assigned_to": current_user["id"], "status": "done"})
    
    return {
        "contracts": {"total": total_contracts, "active": active_contracts, "pending": pending_contracts, "total_value": financial_data.get("total_value", 0), "total_target_profit": financial_data.get("total_target_profit", 0), "total_actual_profit": financial_data.get("total_actual_profit", 0)},
        "profit_status": {"green": green_count, "orange": orange_count, "red": red_count},
        "tasks": {"total": total_tasks, "completed": completed_tasks, "in_progress": in_progress_tasks, "overdue": overdue_tasks, "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)},
        "team": {"total_users": total_users},
        "my_stats": {"total_tasks": my_tasks, "completed": my_completed, "completion_rate": round((my_completed / my_tasks * 100) if my_tasks > 0 else 0, 1)}
    }

@app.get("/api/dashboard/my-tasks")
async def get_my_tasks(current_user: dict = Depends(get_current_user)):
    tasks = []
    async for task in db.tasks.find({"assigned_to": current_user["id"]}).sort("due_date", 1):
        task["_id"] = str(task["_id"])
        contract = await db.contracts.find_one({"id": task["contract_id"]})
        if contract:
            task["contract_number"] = contract["contract_number"]
            task["project_name"] = contract.get("project_name")
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
        overdue = await db.tasks.count_documents({"assigned_to": user["id"], "due_date": {"$lt": datetime.utcnow()}, "status": {"$ne": "done"}})
        
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
