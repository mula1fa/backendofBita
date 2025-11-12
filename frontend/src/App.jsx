import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- 1. استيراد مكتبات Firebase ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut 
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// --- 2. إعدادات Firebase الخاصة بك (من مشروعك) ---
const firebaseConfig = {
  apiKey: "AIzaSyBDdz42hsoiE1ahl93phQ2W2qFyBEH951U",
  authDomain: "bita-c6209.firebaseapp.com",
  projectId: "bita-c6209",
  storageBucket: "bita-c6209.firebasestorage.app",
  messagingSenderId: "487645497987",
  appId: "1:487645497987:web:14825a224fba45129d29b6",
  measurementId: "G-R2X9WZ88CK"
};

// --- 3. تهيئة Firebase ---
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);


// --- أيقونات SVG مدمجة (للاختصار، سأضيف واحدة فقط كمثال) ---
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const HomeIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-[#00BF63]" : "text-gray-400"}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M12 8v4l2 2" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const BeefIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14v-4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v4c0 1.1-.9 2-2 2h-2a2 2 0 0 1-2-2z"></path><path d="M17 14l5-5-5-5"></path><path d="M7 10H2v4h5c1.1 0 2-.9 2-2v0a2 2 0 0 0-2-2z"></path></svg>;
const WheatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22v-6.2c0-1 1-1.8 1.8-1.8h3.9c.8 0 1.8.8 1.8 1.8S8.5 22 7.7 22H2z"></path><path d="M9.4 14c0-1 1-1.8 1.8-1.8h3.9c.8 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8H11.2C10.4 15.8 9.4 15 9.4 14z"></path><path d="M16.6 6c0-1 1-1.8 1.8-1.8h3.9c.8 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8H18.4c-.8 0-1.8-.8-1.8-1.8z"></path><path d="m2 14 7.9-7.9c.8-.8 2.1-.8 2.8 0l7.9 7.9"></path><path d="m11.2 8.8 7.9-7.9c.8-.8 2.1-.8 2.8 0L22 1"></path></svg>;
const DropletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>;
const AlertTriangleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const Loader2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const User = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const ArrowRightCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16l4-4-4-4"/>
    <path d="M8 12h8"/>
  </svg>
);
const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const ScaleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 16v-4c0-.88-.35-1.72-1.03-2.37L12 6l-2.97 3.63C8.35 10.28 8 11.12 8 12v4"></path>
    <path d="M16 16H8a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"></path>
    <path d="M12 2v4"></path>
  </svg>
);
// --- نهاية الأيقونات ---


/**
 * دالة مساعدة لتحويل ملف الصورة إلى Base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // نزيل البادئة
    reader.onerror = (error) => reject(error);
  });
};

/**
 * مكون التنبيهات (نمط تينكان)
 */
const Alert = ({ type, title, message }) => {
  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-900/50' : 'bg-green-900/50';
  const borderColor = isError ? 'border-red-700' : 'border-green-700';
  const textColor = isError ? 'text-red-200' : 'text-green-200';
  const iconColor = isError ? 'text-red-400' : 'text-green-400';
  const icon = isError 
    ? <AlertTriangleIcon className={`w-6 h-6 ${iconColor}`} /> 
    : <CheckCircleIcon className={`w-6 h-6 ${iconColor}`} />;

  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor} shadow-md mt-4`}>
      <div className="flex items-start gap-3" dir="rtl">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          {title && <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>}
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * كارت لعرض النتائج (نمط تينكان)
 */
const InfoCard = ({ icon, title, value, unit, colorClass }) => (
  <div className={`bg-black p-4 rounded-xl shadow-md flex items-center space-x-3 border-r-4 ${colorClass} border-opacity-80`} dir="rtl">
    <div className="flex-shrink-0 p-2 bg-gray-900 rounded-full">{icon}</div>
    <div className="flex-grow">
      <div className="text-sm font-medium text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white">
        {value} <span className="text-base font-normal text-gray-300">{unit}</span>
      </div>
    </div>
  </div>
);


// --- 1. صفحة المصادقة (معدلة لـ Firebase Auth) ---
function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // استخدام Firebase Auth الحقيقي
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged سيتولى الباقي
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('كلمة المرور أو البريد الإلكتروني غير صحيح.');
      } else if (err.code === 'auth/user-not-found') {
        setError('هذا الحساب غير موجود.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مستخدم بالفعل.');
      } else {
        setError('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
      }
      console.error("Firebase Auth Error:", err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#000000] flex-grow animate-fade-in">
      <div className="w-full max-w-sm text-center">
        <img src="/Group 1.svg" alt="شعار B1TE" className="w-32 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</h1>
        <p className="text-gray-400 text-lg mb-6">أدخل بياناتك للمتابعة.</p>

        <form onSubmit={handleSubmit} className="bg-black border border-white/10 rounded-2xl p-6 text-right space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C6AE]"
              placeholder="example@email.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C6AE]"
              placeholder="******"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#7EE8A8] to-[#00C6AE] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all text-lg disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <User className="w-6 h-6" />}
            <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
          </button>
        </form>

        {error && (
          <Alert type="error" message={error} />
        )}

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-white text-md hover:text-[#00C6AE] transition-colors"
        >
          {isLogin ? 'ليس لديك حساب؟ أنشئ حساب الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
        </button>
      </div>
    </div>
  );
}

// --- 2. شاشة اختيار العمر ---
function AgeSelectionPage({ onAgeSelected, initialAge = 25 }) {
  const [age, setAge] = useState(initialAge);

  const handleNext = () => {
    onAgeSelected(age);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#000000] flex-grow animate-slide-in-right">
      <div className="w-full max-w-sm text-center">
        <CalendarIcon className="w-24 h-24 text-[#00C6AE] mx-auto mb-8 animate-bounce-in" />
        <h1 className="text-3xl font-bold text-white mb-4 animate-fade-in-up">اختر عمرك</h1>
        <p className="text-gray-400 text-lg mb-8 animate-fade-in-up delay-100">يساعدنا على تخصيص تجربتك.</p>

        <div className="bg-black border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-white text-5xl font-extrabold mb-6 animate-zoom-in">{age} <span className="text-gray-400 text-3xl">سنة</span></p>
          <input
            type="range"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-[#00C6AE] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
          />
        </div>

        <button
          onClick={handleNext}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#7EE8A8] to-[#00C6AE] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all text-lg shadow-lg"
        >
          <span>التالي</span>
          <ArrowRightCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// --- 3. شاشة اختيار الوزن ---
function WeightSelectionPage({ onWeightSelected, initialWeight = 70, initialUnit = 'kg' }) {
  const [weight, setWeight] = useState(initialWeight);
  const [unit, setUnit] = useState(initialUnit);

  const handleNext = () => {
    onWeightSelected(weight, unit);
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    if (newUnit === 'lb' && unit === 'kg') {
      setWeight(Math.round(weight * 2.20462));
    } else if (newUnit === 'kg' && unit === 'lb') {
      setWeight(Math.round(weight / 2.20462));
    }
    setUnit(newUnit);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#000000] flex-grow animate-slide-in-right">
      <div className="w-full max-w-sm text-center">
        <ScaleIcon className="w-24 h-24 text-[#00C6AE] mx-auto mb-8 animate-bounce-in" />
        <h1 className="text-3xl font-bold text-white mb-4 animate-fade-in-up">كم وزنك؟</h1>
        <p className="text-gray-400 text-lg mb-8 animate-fade-in-up delay-100">دقيق بياناتك لتحليل أفضل.</p>

        <div className="bg-black border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-white text-5xl font-extrabold mb-6 animate-zoom-in">
            {weight} <span className="text-gray-400 text-3xl">{unit}</span>
          </p>
          <input
            type="range"
            min={unit === 'kg' ? "30" : "66"}
            max={unit === 'kg' ? "200" : "440"}
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-[#00C6AE] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
          />
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => handleUnitChange('kg')}
              className={`py-2 px-5 rounded-lg text-lg font-semibold transition-colors ${
                unit === 'kg' ? 'bg-[#00C6AE] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => handleUnitChange('lb')}
              className={`py-2 px-5 rounded-lg text-lg font-semibold transition-colors ${
                unit === 'lb' ? 'bg-[#00C6AE] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              LB
            </button>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#7EE8A8] to-[#00C6AE] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all text-lg shadow-lg"
        >
          <span>لنبدأ!</span>
          <ArrowRightCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}


// --- 4. صفحة التطبيق الرئيسية (معدلة للاتصال بالخادم) ---
function B1TEAppPage({ user, idToken, onLogout, onNavigate }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // --- !! هذا هو الرابط الذي يتصل بالخادم !! ---
  const BACKEND_URL = 'https://backendofbita.onrender.com';

  const handleBoxClick = () => {
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    fileInputRef.current.click();
  };

  // الاتصال بالـ Backend بدلاً من Gemini
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      if (!idToken) {
        throw new Error("المستخدم غير مصادق عليه. حاول تسجيل الخروج والدخول مرة أخرى.");
      }

      const base64ImageData = await fileToBase64(file);
      
      const payload = {
        image_base64: base64ImageData,
        mime_type: file.type,
        appId: 'B1TE' // اسم التطبيق المتفق عليه مع الخادم
      };

      const response = await fetch(`${BACKEND_URL}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // إرسال التوكن للتحقق
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `خطأ من الخادم: ${response.statusText}`);
      }
      
      setAnalysis(responseData);

    } catch (err) {
      console.error("Error analyzing image:", err);
      // التحقق من "صحوة" الخادم
      if (err.message.includes('Failed to fetch') || err.message.includes('timeout')) {
          setError(`فشل الاتصال بالخادم. الخادم "النائم" قد يستغرق 50 ثانية للاستيقاظ. يرجى المحاولة مرة أخرى.`);
      } else {
          setError(`فشل تحليل الصورة: ${err.message}. يرجى المحاولة مرة أخرى.`);
      }
    } finally {
      setIsLoading(false);
      if(fileInputRef.current) fileInputRef.current.value = null;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen animate-fade-in-up">
      {/* الهيدر العلوي */}
      <header className="px-4 py-4 bg-black shadow-sm border-b border-white/10 flex justify-between items-center">
        <img src="/Group 1.svg" alt="شعار B1TE" className="h-8 w-auto" />
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-[#00C6AE]">
          خروج
        </button>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto bg-black pb-24">
        
        {/* صندوق رفع الصورة */}
        <div 
          onClick={handleBoxClick} 
          className="relative w-full h-64 bg-black rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center text-center cursor-pointer hover:border-[#00C6AE] transition-all overflow-hidden"
        >
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          {imagePreview && !isLoading ? (
            <img src={imagePreview} alt="معاينة الوجبة" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center space-y-2 text-gray-400">
              <CameraIcon />
              <p className="font-semibold text-lg">اضغط هنا لمسح وجبتك</p>
              <p className="text-sm">أو اختر من ألبوم الصور</p>
            </div>
          )}

          {isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black bg-opacity-70">
              <div className="w-12 h-12 border-4 border-[#00BF63] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white font-medium text-lg">جاري تحليل وجبتك...</p>
            </div>
          )}
        </div>

        {/* قسم النتائج */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#00BF63]">التحليل الغذائي</h2>
          
          {error && (
            <Alert type="error" title="خطأ" message={error} />
          )}
          
          {analysis && (
            <div className="space-y-4">
              <Alert type="success" title="تم التحليل بنجاح!" message={`وجبتك: ${analysis.foodName}`} />
              <div className="grid grid-cols-2 gap-4">
                <InfoCard 
                  icon={<ZapIcon />} 
                  title="سعرات" 
                  value={Math.round(analysis.calories)} 
                  unit="cal"
                  colorClass="border-[#00BF63]"
                />
                <InfoCard 
                  icon={<BeefIcon />} 
                  title="بروتين" 
                  value={Math.round(analysis.protein)} 
                  unit="g"
                  colorClass="border-red-500"
                />
                <InfoCard 
                  icon={<WheatIcon />} 
                  title="كربوهيدرات" 
                  value={Math.round(analysis.carbs)} 
                  unit="g"
                  colorClass="border-yellow-500"
                />
                <InfoCard 
                  icon={<DropletIcon />} 
                  title="دهون" 
                  value={Math.round(analysis.fats)} 
                  unit="g"
                  colorClass="border-green-500"
                />
              </div>
            </div>
          )}

          {!isLoading && !analysis && !error && (
            <div className="text-center p-8 bg-black rounded-xl shadow-md border border-white/10">
              <p className="text-gray-500">قم بمسح وجبتك لرؤية النتائج هنا.</p>
            </div>
          )}
        </div>

        {/* قسم نصيحة اليوم */}
        {analysis && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#00C6AE]">نصيحة اليوم</h2>
            <div className="bg-black border border-white/10 p-4 rounded-xl shadow-md">
              {analysis.protein < 15 ? (
                <p className="text-gray-300 text-base leading-relaxed">لاحظنا أن هذه الوجبة تحتوي على بروتين قليل. حاول إضافة بعض الزبادي اليوناني أو حفنة من المكسرات في وجبتك القادمة!</p>
              ) : (
                <p className="text-gray-300 text-base leading-relaxed">عمل رائع! هذه الوجبة متوازنة وتساعدك على الوصول لهدفك. استمر!</p>
              )}
            </div>
          </div>
        )}
        
      </main>

      {/* شريط التنقل السفلي */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/95 backdrop-blur shadow-inner border-t border-white/10 flex justify-around items-center p-3 z-50">
        <button className="flex flex-col items-center text-[#00C6AE]" onClick={() => onNavigate('app')}>
          <HomeIcon active={true} />
          <span className="text-xs font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('history')}>
          <HistoryIcon />
          <span className="text-xs font-medium">سجل وجباتي</span>
        </button>
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('profile')}>
          <UserIcon />
          <span className="text-xs font-medium">ملفي</span>
        </button>
      </footer>
    </div>
  );
}

// --- صفحة سجل الوجبات ---
function MealHistoryPage({ idToken, onLogout, onNavigate }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const BACKEND_URL = 'https://backendofbita.onrender.com';

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BACKEND_URL}/get-meal-history?appId=B1TE`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل جلب السجل');
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (idToken) fetchMeals();
  }, [idToken]);

  const parseDate = (ts) => {
    try { const d = new Date(ts); return isNaN(d.getTime()) ? null : d; } catch { return null; }
  };
  const formatDateTime = (ts) => { const d = parseDate(ts); return d ? d.toLocaleString() : '—'; };
  const dayKey = (ts) => { const d = parseDate(ts); if (!d) return 'غير معروف'; const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };

  const grouped = (() => {
    const acc = {};
    for (const m of meals) {
      const key = dayKey(m.timestamp);
      if (!acc[key]) acc[key] = { items: [], total: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
      acc[key].items.push(m);
      acc[key].total.calories += Number(m.calories || 0);
      acc[key].total.protein += Number(m.protein || 0);
      acc[key].total.carbs += Number(m.carbs || 0);
      acc[key].total.fats += Number(m.fats || 0);
    }
    const keys = Object.keys(acc).sort((a, b) => b.localeCompare(a));
    return keys.map(k => ({ day: k, ...acc[k] }));
  })();

  const deleteMeal = async (id) => {
    if (!id) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${BACKEND_URL}/delete-meal?appId=B1TE&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حذف الوجبة');
      setMeals(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in-up">
      <header className="px-4 py-4 bg-black shadow-sm border-b border-white/10 flex justify-between items-center">
        <img src="/Group 1.svg" alt="شعار B1TE" className="h-8 w-auto" />
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-[#00C6AE]">خروج</button>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto bg-black pb-24">
        <h2 className="text-xl font-bold text-[#00C6AE]">سجل وجباتي</h2>

        {loading && (
          <div className="flex items-center gap-3 text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin text-[#00C6AE]" />
            <span>جاري التحميل...</span>
          </div>
        )}

        {error && (<Alert type="error" title="خطأ" message={error} />)}

        {!loading && !error && meals.length === 0 && (
          <div className="text-center p-6 bg-black rounded-xl shadow-md border border-white/10 text-gray-400">
            لا توجد وجبات مسجلة بعد.
          </div>
        )}

        {!loading && !error && meals.length > 0 && (
          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.day} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{group.day}</h3>
                  <div className="text-sm text-gray-300">
                    <span className="mr-3 text-[#00C6AE]">سعرات: {Math.round(group.total.calories)}</span>
                    <span className="mr-3">بروتين: {Math.round(group.total.protein)}g</span>
                    <span className="mr-3">كربوهيدرات: {Math.round(group.total.carbs)}g</span>
                    <span>دهون: {Math.round(group.total.fats)}g</span>
                  </div>
                </div>
                {group.items.map((m) => (
                  <div key={m.id} className="bg-black border border-white/10 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">{m.foodName || 'وجبة'}</p>
                      <p className="text-sm text-gray-400">{formatDateTime(m.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#00C6AE] font-bold">{Math.round(m.calories || 0)} cal</span>
                      <div className="text-xs text-gray-400 mt-1">
                        بروتين: {Math.round(m.protein || 0)}g • كربوهيدرات: {Math.round(m.carbs || 0)}g • دهون: {Math.round(m.fats || 0)}g
                      </div>
                      <button onClick={() => deleteMeal(m.id)} disabled={deletingId === m.id} className="mt-2 px-3 py-1 text-xs rounded-lg border border-white/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                        {deletingId === m.id ? 'جارِ الحذف…' : 'حذف'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/95 backdrop-blur shadow-inner border-t border-white/10 flex justify-around items-center p-3 z-50">
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('app')}>
          <HomeIcon />
          <span className="text-xs font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center text-[#00C6AE]">
          <HistoryIcon active={true} />
          <span className="text-xs font-medium">سجل وجباتي</span>
        </button>
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('profile')}>
          <UserIcon />
          <span className="text-xs font-medium">ملفي</span>
        </button>
      </footer>
    </div>
  );
}

// --- صفحة الملف الشخصي ---
function ProfilePage({ idToken, onLogout, onNavigate }) {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const BACKEND_URL = 'https://backendofbita.onrender.com';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BACKEND_URL}/get-profile?appId=B1TE`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل جلب الملف الشخصي');
        setAge(data.age ?? '');
        setWeight(data.weight ?? '');
        setWeightUnit(data.weightUnit ?? 'kg');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (idToken) fetchProfile();
  }, [idToken]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appId: 'B1TE', age: age ? Number(age) : null, weight: weight ? Number(weight) : null, weightUnit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ الملف الشخصي');
      setMessage('تم حفظ التغييرات بنجاح');
      // حفظ محلي لتجاوز الأسئلة لاحقًا
      try {
        localStorage.setItem('b1te_profile', JSON.stringify({ age: age ? Number(age) : null, weight: weight ? Number(weight) : null, weightUnit }));
      } catch (_) {}
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in-up">
      <header className="px-4 py-4 bg-black shadow-sm border-b border-white/10 flex justify-between items-center">
        <img src="/Group 1.svg" alt="شعار B1TE" className="h-8 w-auto" />
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-[#00C6AE]">خروج</button>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto bg-black pb-24">
        <h2 className="text-xl font-bold text-[#00C6AE]">ملفي الشخصي</h2>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin text-[#00C6AE]" />
            <span>جاري التحميل...</span>
          </div>
        ) : (
          <div className="bg-black border border-white/10 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">العمر</label>
              <input type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C6AE]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">الوزن</label>
              <div className="flex gap-3">
                <input type="number" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C6AE]" />
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-24 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C6AE]">
                  <option value="kg">KG</option>
                  <option value="lb">LB</option>
                </select>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#7EE8A8] to-[#00C6AE] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all text-lg disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin w-6 h-6" /> : null}
              <span>حفظ التغييرات</span>
            </button>
            {message && <Alert type="success" title="نجاح" message={message} />}
            {error && <Alert type="error" title="خطأ" message={error} />}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/95 backdrop-blur shadow-inner border-t border-white/10 flex justify-around items-center p-3 z-50">
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('app')}>
          <HomeIcon />
          <span className="text-xs font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center text-gray-400" onClick={() => onNavigate('history')}>
          <HistoryIcon />
          <span className="text-xs font-medium">سجل وجباتي</span>
        </button>
        <button className="flex flex-col items-center text-[#00C6AE]">
          <UserIcon active={true} />
          <span className="text-xs font-medium">ملفي</span>
        </button>
      </footer>
    </div>
  );
}
// --- 5. المكون الرئيسي (مدير الصفحات) ---
export default function App() {
  const [page, setPage] = useState('loading'); // 'loading', 'auth', 'ageSelection', 'weightSelection', 'app', 'history', 'profile'
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [userData, setUserData] = useState({ age: null, weight: null, weightUnit: null });

  // --- !! هذا هو الرابط الذي يتصل بالخادم !! ---
  const BACKEND_URL = 'https://backendofbita.onrender.com';

  // حفظ محلي للملف الشخصي لتجاوز الأسئلة في حال توفر البيانات
  const saveLocalProfile = (profile) => {
    try {
      localStorage.setItem('b1te_profile', JSON.stringify(profile || {}));
    } catch (_) {}
  };
  const getLocalProfile = () => {
    try {
      const s = localStorage.getItem('b1te_profile');
      return s ? JSON.parse(s) : {};
    } catch (_) {
      return {};
    }
  };
  
  // تحميل الخطوط والأنيميشن و Tailwind
  useEffect(() => {
    // ... (كود تحميل الخطوط والأنيميشن)
    const appFont = document.getElementById('app-font');
    if (!appFont) { /* ... */ }
    const animations = document.getElementById('app-animations');
    if (!animations) { /* ... */ }
    const tailwindScript = document.getElementById('tailwind-cdn');
    if (!tailwindScript) { /* ... */ }
  }, []);

  // --- مراقبة حالة تسجيل الدخول ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        setIdToken(token);
        
        // التحقق إذا كان المستخدم قد أكمل الإعداد (العمر والوزن)
        try {
            const response = await fetch(`${BACKEND_URL}/get-profile?appId=B1TE`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await response.json();
            
            // خزّن البيانات المسترجعة
            setUserData(profileData || {});

            const hasAge = profileData && profileData.age != null;
            const hasWeight = profileData && profileData.weight != null;

            if (hasAge && hasWeight) {
                // اكتمل الإعداد سابقًا — لا تسأل مرة ثانية
                setPage('app');
            } else {
                // نسخة احتياطية من التخزين المحلي إن كانت البيانات موجودة
                const local = getLocalProfile();
                const lAge = local && local.age != null;
                const lWeight = local && local.weight != null;
                if (lAge && lWeight) {
                  setUserData(local);
                  setPage('app');
                } else if (!hasAge) {
                  // ناقص العمر — ابدأ بالخطوة الأولى
                  setPage('ageSelection');
                } else {
                  // العمر موجود لكن الوزن ناقص — أكمل خطوة الوزن فقط
                  setPage('weightSelection');
                }
            }
        } catch (err) {
            console.error("فشل جلب الملف الشخصي:", err);
            // في حال فشل الجلب، إن كان المستخدم معروفًا، لا نكرر الأسئلة إن كانت محفوظة محليًا
            // وإلا فسنعود للإعداد كإجراء احتياطي
            const local = getLocalProfile();
            const lAge = local && local.age != null;
            const lWeight = local && local.weight != null;
            if (lAge && lWeight) {
              setUserData(local);
              setPage('app');
            } else {
              setPage('ageSelection');
            }
        }
      } else {
        // لا يوجد مستخدم
        setUser(null);
        setIdToken(null);
        setPage('auth');
      }
    });

    return () => unsubscribe(); // تنظيف عند إغلاق المكون
  }, []);

  // (1) المستخدم اختار العمر
  const handleAgeSelected = (age) => {
    setUserData(prev => ({ ...prev, age }));
    setPage('weightSelection');
  };

  // (2) المستخدم اختار الوزن (وإرسال البيانات للخادم)
  const handleWeightSelected = async (weight, unit) => {
    const currentAge = userData.age; // العمر من الخطوة السابقة
    setUserData(prev => ({ ...prev, weight, weightUnit: unit }));
    
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        age: currentAge, 
        weight: weight,
        weightUnit: unit,
        appId: 'B1TE'
      };

      await fetch(`${BACKEND_URL}/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      // حفظ محلي لتجاوز الأسئلة لاحقًا
      saveLocalProfile({ age: currentAge, weight, weightUnit: unit });
      
      setPage('app'); // بعد الحفظ بنجاح، انتقل للتطبيق
    } catch (err) {
      console.error("فشل تحديث الملف الشخصي:", err);
      // يمكنك عرض رسالة خطأ هنا للمستخدم
    }
  };

  // (3) المستخدم سجل الخروج
  const handleLogout = () => {
    signOut(auth);
  };
  
  // اختيار الصفحة للعرض
  const renderPage = () => {
    switch (page) {
      case 'loading':
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 text-[#00BF63] animate-spin" />
          </div>
        );
      case 'auth':
        return <AuthPage onAuthSuccess={() => {}} />; // onAuthStateChanged يعالج النجاح
      case 'ageSelection':
        return <AgeSelectionPage onAgeSelected={handleAgeSelected} />;
      case 'weightSelection':
        return <WeightSelectionPage onWeightSelected={handleWeightSelected} />;
      case 'app':
        return <B1TEAppPage user={user} idToken={idToken} onLogout={handleLogout} onNavigate={setPage} />;
      case 'history':
        return <MealHistoryPage idToken={idToken} onLogout={handleLogout} onNavigate={setPage} />;
      case 'profile':
        return <ProfilePage idToken={idToken} onLogout={handleLogout} onNavigate={setPage} />;
      default:
        return <AuthPage onAuthSuccess={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-inter" dir="rtl">
      {/* هذا الـ div يحدد عرض التطبيق ليناسب الموبايل */}
      <div className="w-full max-w-md min-h-screen bg-black text-white shadow-2xl flex flex-col border-x border-gray-800 overflow-hidden">
        {renderPage()}
      </div>
    </div>
  );
}