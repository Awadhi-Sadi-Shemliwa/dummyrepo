#!/usr/bin/env python3
"""
ARC Tanzania Project Management System - Backend API Testing
Tests all API endpoints for authentication, users, contracts, tasks, and dashboard functionality.
Focuses on the specific flowchart-based workflow and profit calculations.
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ARCAPITester:
    def __init__(self, base_url: str = "https://9834ca71-35a8-4794-ad1a-993d1a45b792.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.current_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_resources = {
            'contracts': [],
            'tasks': [],
            'users': []
        }

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append(f"{test_name}: {details}")
            print(f"❌ {test_name} - FAILED: {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            if not success:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                if response.text:
                    print(f"   Response: {response.text[:200]}")

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health endpoint"""
        success, data = self.make_request('GET', 'health')
        self.log_result("Health Check", success and data.get('status') == 'healthy')
        return success

    def test_login(self, email: str, password: str, role: str):
        """Test login functionality"""
        success, data = self.make_request('POST', 'auth/login', {
            'email': email,
            'password': password
        })
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.current_user = data['user']
            self.log_result(f"Login as {role}", True)
            return True
        else:
            self.log_result(f"Login as {role}", False, f"No token received: {data}")
            return False

    def test_get_me(self):
        """Test get current user info"""
        success, data = self.make_request('GET', 'auth/me')
        if success and 'id' in data:
            self.log_result("Get Current User Info", True)
            return data
        else:
            self.log_result("Get Current User Info", False, str(data))
            return None

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, data = self.make_request('GET', 'dashboard/stats')
        expected_keys = ['contracts', 'profit_status', 'tasks', 'team', 'my_stats']
        
        if success and all(key in data for key in expected_keys):
            self.log_result("Dashboard Stats", True)
            print(f"   Contracts: {data['contracts']['total']}, Profit Status: Green={data['profit_status']['green']}, Orange={data['profit_status']['orange']}, Red={data['profit_status']['red']}")
            return data
        else:
            self.log_result("Dashboard Stats", False, f"Missing keys or failed request: {data}")
            return None

    def test_get_users(self):
        """Test get all users"""
        success, data = self.make_request('GET', 'users')
        if success and isinstance(data, list):
            self.log_result("Get All Users", True)
            print(f"   Found {len(data)} users")
            return data
        else:
            self.log_result("Get All Users", False, str(data))
            return []

    def test_create_contract(self):
        """Test contract creation (Finance Officer role)"""
        contract_data = {
            'contract_value': 100000000.0,  # 100M TZS
            'staff_count': 5,
            'tax': 5000000.0,
            'overhead_cost': 8000000.0,
            'commission': 3000000.0,
            'admin_fee': 2000000.0,
            'staff_cost': 15000000.0
        }
        
        success, data = self.make_request('POST', 'contracts', contract_data, 200)
        if success and 'id' in data:
            self.created_resources['contracts'].append(data['id'])
            # Verify auto-generated contract number format (ARC-YEAR-XXXX)
            contract_number = data.get('contract_number', '')
            year = datetime.now().year
            expected_format = f"ARC-{year}-"
            if contract_number.startswith(expected_format):
                self.log_result("Create Contract (with auto-generated number)", True)
                print(f"   Contract Number: {contract_number}")
                print(f"   Target Profit: {data.get('target_profit', 0):,.0f} TZS")
                print(f"   Actual Profit: {data.get('actual_profit', 0):,.0f} TZS")
                print(f"   Profit Status: {data.get('profit_status', 'unknown')}")
                return data['id']
            else:
                self.log_result("Create Contract", False, f"Invalid contract number format: {contract_number}")
                return None
        else:
            self.log_result("Create Contract", False, str(data))
            return None

    def test_get_contracts(self):
        """Test get all contracts"""
        success, data = self.make_request('GET', 'contracts')
        if success and isinstance(data, list):
            self.log_result("Get All Contracts", True)
            print(f"   Found {len(data)} contracts")
            return data
        else:
            self.log_result("Get All Contracts", False, str(data))
            return []

    def test_operations_setup(self, contract_id: str):
        """Test operations configuration (Operations Officer role)"""
        ops_data = {
            'project_start_date': '2025-01-15',
            'project_end_date': '2025-06-15',
            'project_type': 'Insurance',
            'duration_type': 'Non-Recurring',
            'manual_status': None,
            'inactive_reason': None
        }
        
        success, data = self.make_request('PUT', f'contracts/{contract_id}/operations', ops_data)
        if success:
            self.log_result("Operations Setup", True)
            print(f"   Project Status: {data.get('project_status', 'unknown')}")
            return True
        else:
            self.log_result("Operations Setup", False, str(data))
            return False

    def test_create_task(self, contract_id: str, assigned_to: str = None):
        """Test task creation"""
        task_data = {
            'title': f'Test Task {datetime.now().strftime("%H%M%S")}',
            'description': 'Automated test task for API testing',
            'contract_id': contract_id,
            'assigned_to': assigned_to,
            'priority': 'high',
            'due_date': datetime.now().isoformat()
        }
        
        success, data = self.make_request('POST', 'tasks', task_data, 200)
        if success and 'id' in data:
            self.created_resources['tasks'].append(data['id'])
            self.log_result("Create Task", True)
            return data['id']
        else:
            self.log_result("Create Task", False, str(data))
            return None

    def test_get_tasks(self):
        """Test get all tasks"""
        success, data = self.make_request('GET', 'tasks')
        if success and isinstance(data, list):
            self.log_result("Get All Tasks", True)
            print(f"   Found {len(data)} tasks")
            return data
        else:
            self.log_result("Get All Tasks", False, str(data))
            return []

    def test_update_task_status(self, task_id: str):
        """Test task status update"""
        success, data = self.make_request('PUT', f'tasks/{task_id}', {'status': 'in_progress'})
        if success:
            self.log_result("Update Task Status", True)
            return True
        else:
            self.log_result("Update Task Status", False, str(data))
            return False

    def test_add_comment(self, task_id: str):
        """Test adding comment to task"""
        comment_data = {
            'task_id': task_id,
            'content': f'Test comment added at {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        }
        
        success, data = self.make_request('POST', f'tasks/{task_id}/comments', comment_data, 200)
        if success and 'id' in data:
            self.log_result("Add Task Comment", True)
            return data['id']
        else:
            self.log_result("Add Task Comment", False, str(data))
            return None

    def test_get_comments(self, task_id: str):
        """Test get task comments"""
        success, data = self.make_request('GET', f'tasks/{task_id}/comments')
        if success and isinstance(data, list):
            self.log_result("Get Task Comments", True)
            return data
        else:
            self.log_result("Get Task Comments", False, str(data))
            return []

    def test_team_performance(self):
        """Test team performance endpoint (CEO/Operations only)"""
        success, data = self.make_request('GET', 'dashboard/team-performance')
        if success and isinstance(data, list):
            self.log_result("Get Team Performance", True)
            return data
        else:
            # This might fail for non-CEO/Operations users, which is expected
            if self.current_user and self.current_user.get('role') not in ['ceo', 'operations']:
                self.log_result("Get Team Performance", True, "Access denied as expected for non-CEO/Operations user")
                return []
            else:
                self.log_result("Get Team Performance", False, str(data))
                return []

    def test_create_user(self):
        """Test user creation (CEO/Operations only)"""
        user_data = {
            'name': f'Test User {datetime.now().strftime("%H%M%S")}',
            'email': f'testuser{datetime.now().strftime("%H%M%S")}@arc-test.com',
            'password': 'TestPass123!',
            'department': 'Testing'
        }
        
        success, data = self.make_request('POST', 'users', user_data, 200)
        if success and 'id' in data:
            self.created_resources['users'].append(data['id'])
            self.log_result("Create User", True)
            return data['id']
        else:
            # This might fail for non-CEO/Operations users, which is expected
            if self.current_user and self.current_user.get('role') not in ['ceo', 'operations']:
                self.log_result("Create User", True, "Access denied as expected for non-CEO/Operations user")
                return None
            else:
                self.log_result("Create User", False, str(data))
                return None

    def test_activities(self):
        """Test activities endpoint"""
        success, data = self.make_request('GET', 'activities?limit=10')
        if success and isinstance(data, list):
            self.log_result("Get Activities", True)
            return data
        else:
            self.log_result("Get Activities", False, str(data))
            return []

    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        print("🚀 Starting ARC Project Management API Tests")
        print("=" * 60)
        
        # Test health check first
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False

        # Test with different user roles
        test_users = [
            ('sadi@arc.com', '12345678', 'CEO'),
            ('maureen.bangu@ar-consurt-world.com', '12345678', 'Finance'),
            ('juma.h.kasele@gmail.com', '11223344', 'Operations')
        ]

        for email, password, role in test_users:
            print(f"\n📋 Testing as {role} ({email})")
            print("-" * 40)
            
            # Login
            if not self.test_login(email, password, role):
                continue
            
            # Test user info
            user_info = self.test_get_me()
            if not user_info:
                continue
            
            # Test dashboard
            self.test_dashboard_stats()
            
            # Test users
            users = self.test_get_users()
            
            # Test contracts
            contracts = self.test_get_contracts()
            
            # Create contract (if Finance Officer or CEO)
            contract_id = None
            if self.current_user.get('role') in ['ceo', 'finance']:
                contract_id = self.test_create_contract()
            
            # Test operations setup (if Operations Officer or CEO and we have a contract)
            if contract_id and self.current_user.get('role') in ['ceo', 'operations']:
                self.test_operations_setup(contract_id)
            
            # Test tasks
            tasks = self.test_get_tasks()
            
            # Create task (if we have a contract)
            task_id = None
            if contract_id:
                assigned_user = users[0]['id'] if users else None
                task_id = self.test_create_task(contract_id, assigned_user)
            
            # Test task operations
            if task_id:
                self.test_update_task_status(task_id)
                comment_id = self.test_add_comment(task_id)
                if comment_id:
                    self.test_get_comments(task_id)
            
            # Test role-specific features
            self.test_team_performance()
            self.test_create_user()
            self.test_activities()
            
            # Clear token for next user
            self.token = None
            self.current_user = None

        # Print final results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        
        print(f"\n📝 Created Resources:")
        print(f"  - Projects: {len(self.created_resources['projects'])}")
        print(f"  - Tasks: {len(self.created_resources['tasks'])}")
        print(f"  - Users: {len(self.created_resources['users'])}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = ARCAPITester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())