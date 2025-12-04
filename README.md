# 🧥 MERN Stack E-Ticaret Uygulaması (Giyim Mağazası)

![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)
![Node](https://img.shields.io/badge/Backend-Node.js-339933.svg)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Bu proje, modern web teknolojileri (MERN Stack) kullanılarak geliştirilmiş, uçtan uca (Full Stack) çalışan, yönetim paneli ve yetkilendirme sistemi bulunan kapsamlı bir E-Ticaret uygulamasıdır.

## 🚀 Proje Özellikleri

### 👤 Müşteri Arayüzü (Vitrin)
* **🛍️ Ürün Listeleme & Arama:** Kullanıcılar ürünleri görüntüleyebilir ve arama çubuğu ile anlık filtreleme yapabilir.
* **📄 Ürün Detay Sayfası:** Her ürünün kendine ait, büyük fotoğraf ve açıklamalarının olduğu detay sayfası.
* **🛒 Sepet Sistemi:** LocalStorage destekli sepet yapısı (Sayfa yenilense bile sepet silinmez).
* **📱 Responsive Tasarım:** Mobil, tablet ve masaüstü uyumlu modern CSS tasarımı.

### 🛠️ Yönetim Paneli (Admin Dashboard)
* **🛡️ Güvenlik (RBAC):** Sadece rolü `admin` olan kullanıcılar panele erişebilir.
* **📦 Ürün Yönetimi:** Yeni ürün ekleme, fiyat/beden güncelleme, silme ve fotoğraf yükleme.
* **👥 Kullanıcı Yönetimi:** Kayıtlı kullanıcıları listeleme ve "Admin" yetkisi verme/alma.
* **📑 Sekmeli Yapı:** "Ürünler" ve "Kullanıcılar" arasında hızlı geçiş.

### 🔐 Altyapı
* **Güvenlik:** JWT (JSON Web Token) ve BCrypt.js (Şifreleme).
* **Tek Port:** Frontend build edilip Node.js sunucusu üzerinden tek linkte çalışır.

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi bilgisayarınıza kurmak ve başlatmak için terminalde aşağıdaki komutları sırasıyla uygulayın.

### 1. Kurulum (Paketleri Yükleme)
```bash
# Projeyi indirin
git clone [https://github.com/KULLANICI_ADIN/giyim-magazasi.git](https://github.com/KULLANICI_ADIN/giyim-magazasi.git)
cd giyim-magazasi

# Backend kütüphanelerini yükleyin
cd server
npm install

# Frontend kütüphanelerini yükleyin
cd ../client
npm install

# Server klasörüne geçin (Eğer client klasöründeyseniz: cd ../server)
cd ../server

# Uygulamayı başlatın
node index.js

3. Tarayıcı
Sunucu çalıştığında şu adrese gidin: 👉 http://localhost:5000

🔑 Giriş Bilgileri (Admin & Test)
Sunucu ilk kez çalıştırıldığında, veritabanında otomatik olarak bir Master Admin hesabı oluşturulur:

Kullanıcı Adı: admin

Şifre: 123456
