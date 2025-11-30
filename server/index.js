const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = "cok-gizli-anahtar-kelime";

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/giyimdb')
.then(() => console.log("✅ MongoDB Bağlandı!"))
.catch((err) => console.log(err));

// --- MODELLER ---

// 1. Ürün Modeli
const ProductSchema = new mongoose.Schema({
    name: String, price: Number, size: String, img: String
});
const Product = mongoose.model('Product', ProductSchema);

// 2. Kullanıcı Modeli (GÜNCELLENDİ: Rol Eklendi)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" } // Varsayılan herkes 'user'
});
const User = mongoose.model('User', UserSchema);

// --- API ROTALARI ---

// A. KAYIT OL
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Yeni kayıt olanlar otomatik 'user' olur
        const newUser = new User({ username, password: hashedPassword, role: "user" });
        await newUser.save();
        res.status(200).json("Kullanıcı oluşturuldu!");
    } catch (err) { res.status(500).json("Hata oluştu."); }
});

// B. GİRİŞ YAP (GÜNCELLENDİ: Rol bilgisini de gönderiyoruz)
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json("Kullanıcı bulunamadı!");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json("Şifre yanlış!");

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
        // Frontend bilsin diye rolü de gönderiyoruz
        res.status(200).json({ token, username: user.username, role: user.role });
    } catch (err) { res.status(500).json(err); }
});

// C. KULLANICI YÖNETİMİ (YENİ)
// Tüm kullanıcıları getir
app.get('/api/users', async (req, res) => {
    const users = await User.find({}, { password: 0 }); // Şifreleri gönderme, gizli kalsın
    res.json(users);
});

// Kullanıcı rolünü değiştir (Admin yap veya User yap)
app.put('/api/users/:id/role', async (req, res) => {
    const { role } = req.body; // 'admin' veya 'user' gelecek
    await User.findByIdAndUpdate(req.params.id, { role: role });
    res.json("Rol güncellendi");
});

// D. ÜRÜN İŞLEMLERİ (Aynı)
app.get('/api/products', async (req, res) => { const p = await Product.find(); res.json(p); });
app.get('/api/products/:id', async (req, res) => { const p = await Product.findById(req.params.id); res.json(p); });
app.post('/api/products', async (req, res) => { const n = new Product(req.body); await n.save(); res.json(n); });
app.put('/api/products/:id', async (req, res) => { const u = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); res.json(u); });
app.delete('/api/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json("Silindi"); });


// Sunucu her başladığında bu çalışır. 'admin' yoksa yaratır.
// --- OTOMATİK MASTER ADMIN OLUŞTURUCU (GÜVENLİ HALİ) ---
const createAdmin = async () => {
    // Önce kontrol et: Admin zaten var mı?
    const adminExists = await User.findOne({ username: "admin" });
    
    // Eğer YOKSA oluştur (Varsa dokunma, verileri silme)
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash("123456", 10);
        const adminUser = new User({
            username: "admin",
            password: hashedPassword,
            role: "admin"
        });
        await adminUser.save();
        console.log("👑 MASTER ADMIN OLUŞTURULDU: (Kullanıcı: admin, Şifre: 123456)");
    }
};
createAdmin();

// --- FRONTEND MERGE ---
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get(/.*/, (req, res) => { res.sendFile(path.join(__dirname, '../client/dist/index.html')); });

app.listen(5000, () => { console.log("🚀 Sunucu 5000 portunda çalışıyor..."); });