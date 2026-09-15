import os
import smtplib
import base64
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Lathala Dispatch Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase connection error: {e}")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")

ORGANIZATION_NAME = os.getenv("ORGANIZATION_NAME", "Lathala Studio")
EMAIL_SUBJECT = os.getenv("EMAIL_SUBJECT", "Weekly Campaign Dispatch")

class LinkZone(BaseModel):
    top: float
    height: float
    url: str

class DispatchSingleRequest(BaseModel):
    subscriber_id: str
    image_base64: str
    link_zones: Optional[List[LinkZone]] = []

class DispatchAllRequest(BaseModel):
    image_base64: str
    link_zones: Optional[List[LinkZone]] = []

def extract_base64_bytes(data_url: str) -> bytes:
    if "," in data_url:
        data_url = data_url.split(",")[1]
    return base64.b64decode(data_url)

def send_email_dispatch(recipient_email: str, recipient_name: str, image_bytes: bytes, link_zones: List[LinkZone]):
    msg = MIMEMultipart('related')
    msg['Subject'] = EMAIL_SUBJECT
    msg['From'] = f"{ORGANIZATION_NAME} <{GMAIL_USER}>"
    msg['To'] = recipient_email

    primary_link = link_zones[0].url if link_zones else "https://example.com"

    html_content = f"""
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 20px 0; background-color: #f3f4f6; font-family: sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 0; margin: 0; line-height: 0;">
              <a href="{primary_link}" target="_blank" style="text-decoration: none; display: block;">
                <img src="cid:newsletter_image" alt="Campaign Graphic" width="600" style="display: block; width: 100%; border: 0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px; font-size: 11px; color: #9ca3af; background-color: #fafafa;">
              &copy; {datetime.now().year} {ORGANIZATION_NAME}. Sent to {recipient_name}.
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    msg_alternative = MIMEMultipart('alternative')
    msg.attach(msg_alternative)
    msg_alternative.attach(MIMEText(html_content, 'html'))

    img = MIMEImage(image_bytes, 'png')
    img.add_header('Content-ID', '<newsletter_image>')
    img.add_header('Content-Disposition', 'inline', filename='newsletter.png')
    msg.attach(img)

    if GMAIL_USER and GMAIL_APP_PASSWORD:
        try:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
                server.send_message(msg)
                print(f"Successfully dispatched email to {recipient_email}")
        except Exception as e:
            print(f"SMTP Dispatch Error for {recipient_email}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subscribers")
def get_subscribers():
    if not supabase:
        return []
    res = supabase.table("subscribers").select("*").order("created_at").execute()
    return res.data

@app.post("/api/dispatch/single")
def dispatch_single(payload: DispatchSingleRequest):
    now_str = datetime.now().strftime("%m/%d %H:%M")
    status_label = f"SENT ({now_str})"
    image_bytes = extract_base64_bytes(payload.image_base64)

    if supabase:
        res = supabase.table("subscribers").select("*").eq("id", payload.subscriber_id).execute()
        if res.data:
            sub = res.data[0]
            send_email_dispatch(sub['email'], sub['name'], image_bytes, payload.link_zones or [])
            supabase.table("subscribers").update({
                "is_sent": True,
                "status": status_label,
                "last_sent_at": datetime.now().isoformat()
            }).eq("id", payload.subscriber_id).execute()

    return {"success": True, "status": status_label}

@app.post("/api/dispatch/all")
def dispatch_all(payload: DispatchAllRequest):
    now_str = datetime.now().strftime("%m/%d %H:%M")
    status_label = f"SENT ({now_str})"
    image_bytes = extract_base64_bytes(payload.image_base64)
    sent_count = 0

    if supabase:
        res = supabase.table("subscribers").select("*").eq("is_sent", False).execute()
        for sub in res.data:
            try:
                send_email_dispatch(sub['email'], sub['name'], image_bytes, payload.link_zones or [])
                supabase.table("subscribers").update({
                    "is_sent": True,
                    "status": status_label,
                    "last_sent_at": datetime.now().isoformat()
                }).eq("id", sub['id']).execute()
                sent_count += 1
            except Exception as e:
                print(f"Error sending to {sub['email']}: {e}")

    return {"success": True, "sent_count": sent_count, "status": status_label}