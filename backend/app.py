import os
import json
import requests
import firebase_admin
import base64 # <-- 1. لاستيراد المفتاح السري
from firebase_admin import credentials, firestore, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# --- 1. تحميل متغيرات البيئة من Vercel ---
load_dotenv() 
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID')
EDAMAM_APP_KEY = os.getenv('EDAMAM_APP_KEY')

# --- 2. تهيئة Flask و Firebase (من متغيرات البيئة) ---
app = Flask(__name__)
CORS(app) # السماح بالاتصال من أي مكان

try:
    # <-- 2. قراءة المفتاح المرمز من متغيرات البيئة
    creds_base64 = os.getenv('GOOGLE_CREDS_BASE64')
    if not creds_base64:
        raise ValueError("متغير GOOGLE_CREDS_BASE64 غير موجود.")
        
    # <-- 3. فك ترميز المفتاح وقراءته كـ JSON
    creds_json_str = base64.b64decode(creds_base64).decode('utf-8')
    creds_dict = json.loads(creds_json_str)
    
    cred = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK مُهيأ بنجاح (من متغير البيئة).")

except ValueError as e:
    if 'The default Firebase app already exists' in str(e):
        print("Firebase مُهيأ مسبقاً.")
        db = firestore.client()
    else:
        print(f"خطأ فادح في تهيئة Firebase: {e}")
        db = None
except Exception as e:
    print(f"خطأ غير متوقع في تهيئة Firebase: {e}")
    db = None

# --- 3. دالة مساعدة للتحقق من هوية المستخدم ---
def _verify_token(request):
    try:
        id_token = request.headers.get('Authorization').split('Bearer ')[1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        print(f"خطأ في التحقق من التوكن: {e}")
        return None

# --- 4. نقاط الاتصال (Endpoints) ---
# (هام: كل المسارات تبدأ بـ /api/ الآن)

@app.route('/api/') # <-- تعديل المسار
def home():
    return "B1TE Backend Server (v2 - Hybrid) is running on Vercel!"

@app.route('/api/update-profile', methods=['POST']) # <-- تعديل المسار
def update_profile():
    user_id = _verify_token(request)
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    if not db: return jsonify({"error": "Database not initialized"}), 500
    try:
        data = request.json
        profile_ref = db.collection(f'artifacts/{data.get("appId")}/users/{user_id}/profile').document('user_data')
        profile_ref.set(data, merge=True)
        return jsonify({"success": True, "message": "تم تحديث الملف الشخصي"}), 200
    except Exception as e:
        print(f"خطأ في /update-profile: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-profile', methods=['GET']) # <-- تعديل المسار
def get_profile():
    user_id = _verify_token(request)
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    if not db: return jsonify({"error": "Database not initialized"}), 500
    try:
        app_id = request.args.get('appId')
        if not app_id:
            return jsonify({"error": "appId مطلوب"}), 400
        profile_ref = db.collection(f'artifacts/{app_id}/users/{user_id}/profile').document('user_data')
        doc = profile_ref.get()
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({}), 200
    except Exception as e:
        print(f"خطأ في /get-profile: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-image', methods=['POST']) # <-- تعديل المسار
def analyze_image_hybrid():
    user_id = _verify_token(request)
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    if not db: return jsonify({"error": "Database not initialized"}), 500
    try:
        data = request.json
        image_base64 = data.get('image_base64')
        mime_type = data.get('mime_type')
        app_id = data.get('appId')
        if not all([image_base64, mime_type, app_id]):
            return jsonify({"error": "بيانات ناقصة"}), 400
        if not all([GEMINI_API_KEY, EDAMAM_APP_ID, EDAMAM_APP_KEY]):
            return jsonify({"error": "مفاتيح API غير مكتملة في الخادم"}), 500

        print("الاتصال بـ Gemini للتعرف على المكونات...")
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={GEMINI_API_KEY}"
        
        prompt = """
        Analyze the food in this image. 
        Respond ONLY in JSON format.
        Your response must be a JSON object with a single key "ingredients".
        This key must contain an array of strings.
        Each string must be *only* the quantity and the food name.
        **DO NOT** add any extra descriptive text in parentheses.
        Good Example: {"ingredients": ["180g glazed chicken breast", "1.5 cups cooked white rice", "50g green beans"]}
        """
        gemini_payload = {
            "contents": [{"parts": [{"text": prompt}, {"inlineData": {"mimeType": mime_type, "data": image_base64}}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        response_gemini = requests.post(gemini_url, json=gemini_payload)
        response_gemini.raise_for_status() 
        gemini_result = response_gemini.json()
        ingredients_text = gemini_result["candidates"][0]["content"]["parts"][0]["text"]
        ingredients_list = json.loads(ingredients_text).get("ingredients", [])

        if not ingredients_list:
            return jsonify({"error": "لم يستطع Gemini التعرف على الطعام"}), 404
        print(f"Gemini وجد المكونات (نظيفة): {ingredients_list}")

        print("الاتصال بـ Edamam لحساب التغذية...")
        edamam_url = f"https://api.edamam.com/api/nutrition-details?app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}"
        edamam_payload = { "ingr": ingredients_list }

        response_edamam = requests.post(edamam_url, json=edamam_payload)
        response_edamam.raise_for_status()
        edamam_data = response_edamam.json()
        
        total_calories = 0
        total_protein = 0
        total_fats = 0
        total_carbs = 0
        
        if "ingredients" in edamam_data:
            for item in edamam_data.get("ingredients", []):
                if "parsed" in item:
                    for parsed_item in item.get("parsed", []):
                        if "nutrients" in parsed_item:
                            nutrients = parsed_item["nutrients"]
                            total_calories += nutrients.get("ENERC_KCAL", {}).get("quantity", 0)
                            total_protein += nutrients.get("PROCNT", {}).get("quantity", 0)
                            total_fats += nutrients.get("FAT", {}).get("quantity", 0)
                            total_carbs += nutrients.get("CHOCDF", {}).get("quantity", 0)

        print(f"الحسابات اليدوية: Cals={total_calories}, Prot={total_protein}, Fat={total_fats}, Carb={total_carbs}")
        
        final_analysis = {
            "foodName": ", ".join(ingredients_list), 
            "calories": total_calories,
            "protein": total_protein,
            "fats": total_fats,
            "carbs": total_carbs,
            "components": ingredients_list, 
            "timestamp": firestore.SERVER_TIMESTAMP 
        }

        print("حفظ النتيجة في Firestore...")
        meals_ref = db.collection(f'artifacts/{app_id}/users/{user_id}/meals')
        meals_ref.add(final_analysis)
        final_analysis['timestamp'] = datetime.utcnow().isoformat() + 'Z' 
        print("إرسال النتيجة إلى React.")
        return jsonify(final_analysis), 200

    except requests.exceptions.HTTPError as e:
        service_name = "Gemini" if "generativelanguage" in e.request.url else "Edamam"
        print(f"خطأ HTTP من {service_name}: {e.response.text}")
        return jsonify({"error": f"خطأ من {service_name} API", "details": e.response.text}), 502
    except TypeError as e:
        print(f"خطأ فادح (TypeError) في /analyze-image: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"خطأ فادح في /analyze-image: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-meal-history', methods=['GET']) # <-- تعديل المسار
def get_meal_history():
    user_id = _verify_token(request)
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    if not db: return jsonify({"error": "Database not initialized"}), 500
    try:
        app_id = request.args.get('appId')
        if not app_id: return jsonify({"error": "appId مطلوب"}), 400
        meals_ref = db.collection(f'artifacts/{app_id}/users/{user_id}/meals')
        meals_query = meals_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).get()
        meals = []
        for doc in meals_query:
            meal_data = doc.to_dict()
            meal_data['id'] = doc.id
            if 'timestamp' in meal_data and isinstance(meal_data['timestamp'], datetime):
                meal_data['timestamp'] = meal_data['timestamp'].isoformat()
            meals.append(meal_data)
        return jsonify(meals), 200
    except Exception as e:
        print(f"خطأ في /get-meal-history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete-meal', methods=['DELETE']) # <-- تعديل المسار
def delete_meal():
    user_id = _verify_token(request)
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    if not db: return jsonify({"error": "Database not initialized"}), 500
    try:
        app_id = request.args.get('appId') or (request.json or {}).get('appId')
        meal_id = request.args.get('id') or (request.json or {}).get('id')
        if not app_id or not meal_id:
            return jsonify({"error": "appId و id مطلوبان"}), 400
        meal_doc = db.collection(f'artifacts/{app_id}/users/{user_id}/meals').document(meal_id)
        if not meal_doc.get().exists:
            return jsonify({"error": "الوجبة غير موجودة"}), 404
        meal_doc.delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"خطأ في /delete-meal: {e}")
        return jsonify({"error": str(e)}), 500

# --- 5. حذف `app.run()` ---
# (if __name__ == "__main__":... تم حذفه بالكامل)