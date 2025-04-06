import os
import time
from datetime import datetime, timezone
import schedule
from dotenv import load_dotenv
from notion_client import Client
from supabase import create_client, Client as SupabaseClient

# 환경 변수 로드
load_dotenv()

# Notion 클라이언트 초기화
notion = Client(auth=os.environ.get("NOTION_API_KEY"))
DATABASE_ID = os.environ.get("NOTION_DATABASE_ID")

# Supabase 클라이언트 초기화
supabase: SupabaseClient = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

def get_notion_data():
    """Notion 데이터베이스에서 데이터 가져오기"""
    try:
        response = notion.databases.query(
            database_id=DATABASE_ID,
            sorts=[{"timestamp": "last_edited_time", "direction": "descending"}]
        )
        return response.get("results", [])
    except Exception as e:
        print(f"Notion 데이터 조회 중 오류 발생: {e}")
        return []

def format_notion_data(page):
    """Notion 페이지 데이터를 Supabase 형식으로 변환"""
    properties = page.get("properties", {})
    
    return {
        "title": properties.get("title", {}).get("title", [{}])[0].get("plain_text", ""),
        "company": properties.get("company", {}).get("select", {}).get("name", ""),
        "stage": properties.get("stage", {}).get("select", {}).get("name", ""),
        "status": properties.get("status", {}).get("select", {}).get("name", ""),
        "stakeholder": properties.get("stakeholder", {}).get("rich_text", [{}])[0].get("plain_text", ""),
        "pm": properties.get("pm", {}).get("rich_text", [{}])[0].get("plain_text", ""),
        "training": properties.get("training", {}).get("checkbox", False),
        "genai": properties.get("genai", {}).get("checkbox", False),
        "digital_output": properties.get("digital_output", {}).get("checkbox", False),
        "project_document": properties.get("project_document", {}).get("url", ""),
        "expected_schedule": properties.get("expected_schedule", {}).get("date", {}).get("start"),
        "last_edited_time": page.get("last_edited_time"),
        "notion_id": page.get("id")
    }

def record_change(project_data, old_data, field_name, field_key):
    """변경 사항 기록"""
    if project_data.get(field_key) != old_data.get(field_key):
        supabase.table("project_changes").insert({
            "project_title": project_data["title"],
            "field": field_key,
            "field_name": field_name,
            "old_value": old_data.get(field_key),
            "new_value": project_data.get(field_key)
        }).execute()

def sync_data():
    """Notion과 Supabase 간의 데이터 동기화"""
    print(f"데이터 동기화 시작: {datetime.now(timezone.utc)}")
    
    try:
        # Notion 데이터 가져오기
        notion_pages = get_notion_data()
        
        # 현재 Supabase 데이터 가져오기
        response = supabase.table("project_list").select("*").execute()
        existing_projects = {
            project["notion_id"]: project 
            for project in response.data
        } if response.data else {}

        # 각 Notion 페이지 처리
        for page in notion_pages:
            project_data = format_notion_data(page)
            notion_id = project_data["notion_id"]
            
            if notion_id in existing_projects:
                # 기존 프로젝트 업데이트
                old_data = existing_projects[notion_id]
                
                # 변경 사항 감지 및 기록
                fields_to_check = [
                    ("상태", "status"),
                    ("단계", "stage"),
                    ("PM", "pm"),
                    ("이해관계자", "stakeholder")
                ]
                
                for field_name, field_key in fields_to_check:
                    record_change(project_data, old_data, field_name, field_key)
                
                # Supabase 데이터 업데이트
                supabase.table("project_list")\
                    .update(project_data)\
                    .eq("notion_id", notion_id)\
                    .execute()
            else:
                # 새 프로젝트 등록
                supabase.table("project_list")\
                    .insert(project_data)\
                    .execute()
                
                # 새 프로젝트 등록 변경 사항 기록
                supabase.table("project_changes").insert({
                    "project_title": project_data["title"],
                    "field": "registration",
                    "field_name": "프로젝트 등록",
                    "old_value": None,
                    "new_value": "신규 등록"
                }).execute()

        print(f"데이터 동기화 완료: {datetime.now(timezone.utc)}")
        
    except Exception as e:
        print(f"동기화 중 오류 발생: {e}")

def main():
    """메인 실행 함수"""
    print("Notion-Supabase 실시간 동기화 시작...")
    
    # 초기 동기화 실행
    sync_data()
    
    # 5분마다 동기화 실행 스케줄링
    schedule.every(5).minutes.do(sync_data)
    
    # 스케줄러 실행
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main() 