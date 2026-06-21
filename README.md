# Wedding
# To'yxona Bronlash Tizimi (Wedding Venue Booking Platform)

Toshkent shahridagi to'yxonalarni onlayn qidirish, filtrlash va ma'lum bir kunga avans to'lash orqali bron qilish imkonini beruvchi Full-stack veb-ilova.

Loyihaning maqsadi to'yxona egalari va mijozlar o'rtasidagi qog'ozbozlik va vaqt yo'qotishlarini onlayn tizim orqali hal qilishdir.

## Live Demo & CI/CD
* **Veb-sayt (Demo):** [Bu yerga AWS linkini yoki domenini qo'ying]
* **CI/CD Pipeline:** GitHub Actions yordamida har bir `main` branchga push bo'lganda kod avtomatik tarzda tekshiriladi va AWS'ga deploy qilinadi.

---

## 🛠️ Texnologik Stak (Tech Stack)

* **Frontend:** React.js, Tailwind CSS, Axios, Context API / React Hooks
* **Backend:** Node.js, Express.js, JWT (Autentifikatsiya), Nodemailer (OTP uchun)
* **Ma'lumotlar Bazasi:** PostgreSQL (Relational DB)
* **DevOps & Cloud:** AWS (EC2/S3), GitHub Actions (CI/CD Pipeline)

---

## Asosiy Imkoniyatlar (Features)

### Foydalanuvchilar (Mijozlar) uchun:
* **Moslashuvchan Qidiruv:** To'yxonalarni nomi (katta-kichik harf farqsiz), Toshkent rayonlari, o'rindiq narxi va sig'imi bo'yicha saralash.
* **Dinamik Kalendar:** Bo'sh kunlar (yashil), band kunlar (qizil) va o'tib ketgan kunlar (kulrang) vizual ko'rinishi.
* **Aqlli Narx Hisoblagich:** Tanlangan odam soni va qo'shimcha xizmatlar (Xonanda, Karnay-surnay, Menu, Kortej) hisobidan jami summani va **20% avansni** real vaqtda hisoblash.

### To'yxona Egalari (Owners) uchun:
* **OTP Verifikatsiya:** Ilk bor kirganda Email orqali xavfsiz kod tasdiqlash.
* **Tizim:** O'z to'yxonasi ma'lumotlarini tahrirlash va kelgan bronlarni jadval ko'rinishida boshqarish (tasdiqlash/bekor qilish).

### Administrator uchun:
* Yangi to'yxonalar qo'shish, ularga ega (Owner) biriktirish va platformadagi barcha bandlovlarni monitoring qilish.

---

##  Ma'lumotlar Bazasi Strukturasi (Database Schema)

Loyiha PostgreSQL relyatsion ma'lumotlar bazasida qurilgan va quyidagi asosiy jadvallardan iborat:
* `users` — barcha rollar (Admin, Owner, Customer) va verifikatsiya holatlari.
* `venues` — to'yxona ma'lumotlari, suratlar va qo'shimcha xizmatlarning `JSONB` arxitekturasi.
* `bookings` — band qilingan sanalar, foydalanuvchilar va jami hisoblangan summalar.

---

##  Loyihani Mahalliy (Local) Ishga Tushirish

### 1. Repozitoriyani yuklab oling:
```bash
git clone [https://github.com/USERNAME/REPOS-NAME.git](https://github.com/USERNAME/REPOS-NAME.git)
cd REPOS-NAME

cd backend
npm install
# .env faylini ochib, DB_URL, JWT_SECRET va AWS kalitlarini kiriting
npm start


cd ../frontend
npm install
npm start

Muallif (Author)
Gavharoy-Azamatova - Junior Frontend / Node.js & React Developer

LinkedIn: linkedin.com/in/gavharoy-azamatxojaeva-138929282

Telegram: @gavharazamatova
