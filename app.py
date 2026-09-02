import hashlib
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "melap.db"
OTP_TTL_MINUTES = 10

app = Flask(__name__, static_folder=None)


def utc_now():
    return datetime.now(timezone.utc)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    db.executescript(
        """
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            city TEXT NOT NULL,
            gender TEXT NOT NULL CHECK(gender IN ('Man', 'Woman')),
            privacy_consent_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            plan TEXT NOT NULL CHECK(plan IN ('men-monthly', 'men-yearly', 'women-free')),
            status TEXT NOT NULL CHECK(status IN ('active', 'cancel-at-period-end')),
            current_period_end TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected')),
            created_at TEXT NOT NULL,
            responded_at TEXT,
            UNIQUE(requester_id, recipient_id)
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    )
    db.commit()
    db.close()


def json_error(message, status=400):
    return jsonify({"error": message}), status


def require_json():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None
    return data


def hash_otp(code):
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        return None
    row = get_db().execute(
        """
        SELECT users.* FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ? AND sessions.expires_at > ?
        """,
        (token, utc_now().isoformat()),
    ).fetchone()
    return row


def require_user():
    user = current_user()
    if user is None:
        return None, json_error("Authentication required.", 401)
    return user, None


def is_premium(user_id):
    row = get_db().execute(
        """
        SELECT 1 FROM subscriptions
        WHERE user_id = ? AND status IN ('active', 'cancel-at-period-end')
        AND current_period_end > ?
        """,
        (user_id, utc_now().isoformat()),
    ).fetchone()
    return row is not None


def opposite_gender(gender):
    return "Woman" if gender == "Man" else "Man"


def have_accepted_connection(first_id, second_id):
    return get_db().execute(
        """
        SELECT 1 FROM connections
        WHERE status = 'accepted'
        AND ((requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?))
        """,
        (first_id, second_id, second_id, first_id),
    ).fetchone() is not None


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        return json_error("Not found.", 404)
    return send_from_directory(BASE_DIR, path)


@app.post("/api/register")
def register():
    data = require_json()
    if data is None:
        return json_error("A JSON request body is required.")

    full_name = str(data.get("fullName", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    city = str(data.get("city", "")).strip()
    gender = str(data.get("gender", "")).strip()
    privacy_consent = data.get("privacyConsent") is True

    if not full_name or not email or not city or gender not in {"Man", "Woman"}:
        return json_error("Name, email, city, and gender are required.")
    if "@" not in email:
        return json_error("Enter a valid email address.")
    if not privacy_consent:
        return json_error("Privacy consent is required to create an account.")

    db = get_db()
    now = utc_now().isoformat()
    try:
        cursor = db.execute(
            """
            INSERT INTO users (full_name, email, city, gender, privacy_consent_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (full_name, email, city, gender, now, now),
        )
        user_id = cursor.lastrowid
        if gender == "Woman":
            period_end = (utc_now() + timedelta(days=365)).isoformat()
            db.execute(
                """
                INSERT INTO subscriptions (user_id, plan, status, current_period_end, created_at, updated_at)
                VALUES (?, 'women-free', 'active', ?, ?, ?)
                """,
                (user_id, period_end, now, now),
            )
        db.commit()
    except sqlite3.IntegrityError:
        return json_error("An account with this email already exists.", 409)

    return jsonify({
        "user": {"id": user_id, "fullName": full_name, "email": email, "city": city, "gender": gender},
        "premium": gender == "Woman",
        "plan": "women-free" if gender == "Woman" else None,
    }), 201


@app.post("/api/otp/request")
def request_otp():
    data = require_json()
    if data is None:
        return json_error("A JSON request body is required.")
    email = str(data.get("email", "")).strip().lower()
    if not email:
        return json_error("Email is required.")
    if get_db().execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone() is None:
        return json_error("No account found for this email.", 404)

    code = f"{secrets.randbelow(1_000_000):06d}"
    now = utc_now()
    db = get_db()
    db.execute("UPDATE otp_codes SET used_at = ? WHERE email = ? AND used_at IS NULL", (now.isoformat(), email))
    db.execute(
        "INSERT INTO otp_codes (email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (email, hash_otp(code), (now + timedelta(minutes=OTP_TTL_MINUTES)).isoformat(), now.isoformat()),
    )
    db.commit()
    response = {"message": "OTP created. In production, it is sent by email.", "expiresInMinutes": OTP_TTL_MINUTES}
    if app.config["DEBUG"]:
        response["developmentCode"] = code
    return jsonify(response)


@app.post("/api/otp/verify")
def verify_otp():
    data = require_json()
    if data is None:
        return json_error("A JSON request body is required.")
    email = str(data.get("email", "")).strip().lower()
    code = str(data.get("code", "")).strip()
    if not email or len(code) != 6 or not code.isdigit():
        return json_error("A valid email and 6-digit OTP are required.")

    db = get_db()
    otp = db.execute(
        """
        SELECT * FROM otp_codes
        WHERE email = ? AND code_hash = ? AND used_at IS NULL AND expires_at > ?
        ORDER BY id DESC LIMIT 1
        """,
        (email, hash_otp(code), utc_now().isoformat()),
    ).fetchone()
    if otp is None:
        return json_error("Invalid or expired OTP.", 401)

    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    token = secrets.token_urlsafe(32)
    now = utc_now()
    db.execute("UPDATE otp_codes SET used_at = ? WHERE id = ?", (now.isoformat(), otp["id"]))
    db.execute(
        "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (token, user["id"], (now + timedelta(days=30)).isoformat(), now.isoformat()),
    )
    db.commit()
    return jsonify({"token": token, "user": dict(user), "premium": is_premium(user["id"])})


@app.get("/api/profiles")
def profiles():
    user, error = require_user()
    if error:
        return error
    if not is_premium(user["id"]):
        return json_error("Premium is required to view nearby profiles.", 403)

    rows = get_db().execute(
        """
        SELECT id, full_name, city, gender FROM users
        WHERE id != ? AND gender = ?
        ORDER BY created_at DESC
        """,
        (user["id"], opposite_gender(user["gender"])),
    ).fetchall()
    return jsonify({"profiles": [dict(row) for row in rows]})


@app.post("/api/connections")
def create_connection():
    user, error = require_user()
    if error:
        return error
    if not is_premium(user["id"]):
        return json_error("Premium is required to send connection requests.", 403)
    data = require_json()
    if data is None:
        return json_error("A JSON request body is required.")
    recipient_id = data.get("recipientId")
    if not isinstance(recipient_id, int) or recipient_id == user["id"]:
        return json_error("A valid recipient is required.")

    db = get_db()
    recipient = db.execute("SELECT id, gender FROM users WHERE id = ?", (recipient_id,)).fetchone()
    if recipient is None or recipient["gender"] == user["gender"]:
        return json_error("This profile is not available for a connection request.", 404)
    try:
        db.execute(
            "INSERT INTO connections (requester_id, recipient_id, status, created_at) VALUES (?, ?, 'pending', ?)",
            (user["id"], recipient_id, utc_now().isoformat()),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return json_error("A connection request already exists.", 409)
    return jsonify({"message": "Connection request sent."}), 201


@app.post("/api/connections/<int:connection_id>/respond")
def respond_to_connection(connection_id):
    user, error = require_user()
    if error:
        return error
    data = require_json()
    action = data.get("action") if data else ""
    if action not in {"accept", "reject"}:
        return json_error("Action must be accept or reject.")

    db = get_db()
    connection = db.execute(
        "SELECT * FROM connections WHERE id = ? AND recipient_id = ? AND status = 'pending'",
        (connection_id, user["id"]),
    ).fetchone()
    if connection is None:
        return json_error("Pending connection request not found.", 404)
    status = "accepted" if action == "accept" else "rejected"
    db.execute("UPDATE connections SET status = ?, responded_at = ? WHERE id = ?", (status, utc_now().isoformat(), connection_id))
    db.commit()
    return jsonify({"status": status})


@app.get("/api/connections")
def list_connections():
    user, error = require_user()
    if error:
        return error
    rows = get_db().execute(
        """
        SELECT connections.*, requester.full_name AS requester_name, recipient.full_name AS recipient_name
        FROM connections
        JOIN users AS requester ON requester.id = connections.requester_id
        JOIN users AS recipient ON recipient.id = connections.recipient_id
        WHERE requester_id = ? OR recipient_id = ?
        ORDER BY connections.created_at DESC
        """,
        (user["id"], user["id"]),
    ).fetchall()
    return jsonify({"connections": [dict(row) for row in rows]})


@app.post("/api/messages")
def send_message():
    user, error = require_user()
    if error:
        return error
    data = require_json()
    if data is None:
        return json_error("A JSON request body is required.")
    recipient_id = data.get("recipientId")
    body = str(data.get("body", "")).strip()
    if not isinstance(recipient_id, int) or not body:
        return json_error("Recipient and message are required.")
    if len(body) > 1000:
        return json_error("Messages cannot exceed 1000 characters.")
    if not have_accepted_connection(user["id"], recipient_id):
        return json_error("Messaging is available only after mutual confirmation.", 403)

    db = get_db()
    cursor = db.execute(
        "INSERT INTO messages (sender_id, recipient_id, body, created_at) VALUES (?, ?, ?, ?)",
        (user["id"], recipient_id, body, utc_now().isoformat()),
    )
    db.commit()
    return jsonify({"id": cursor.lastrowid, "message": "Message sent."}), 201


@app.post("/api/subscriptions")
def activate_subscription():
    user, error = require_user()
    if error:
        return error
    data = require_json()
    plan = data.get("plan") if data else ""
    if user["gender"] != "Man" or plan not in {"men-monthly", "men-yearly"}:
        return json_error("This plan is unavailable.", 400)

    now = utc_now()
    period_days = 31 if plan == "men-monthly" else 365
    db = get_db()
    db.execute(
        """
        INSERT INTO subscriptions (user_id, plan, status, current_period_end, created_at, updated_at)
        VALUES (?, ?, 'active', ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          plan = excluded.plan, status = 'active', current_period_end = excluded.current_period_end, updated_at = excluded.updated_at
        """,
        (user["id"], plan, (now + timedelta(days=period_days)).isoformat(), now.isoformat(), now.isoformat()),
    )
    db.commit()
    return jsonify({"plan": plan, "status": "active"})


@app.post("/api/subscriptions/cancel")
def cancel_subscription():
    user, error = require_user()
    if error:
        return error
    db = get_db()
    result = db.execute(
        "UPDATE subscriptions SET status = 'cancel-at-period-end', updated_at = ? WHERE user_id = ? AND status = 'active'",
        (utc_now().isoformat(), user["id"]),
    )
    if result.rowcount == 0:
        return json_error("No active subscription found.", 404)
    db.commit()
    return jsonify({"status": "cancel-at-period-end"})


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
