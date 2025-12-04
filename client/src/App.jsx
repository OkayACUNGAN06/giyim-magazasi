import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// --- BASİT SAYFALAR (GERİ GELDİ) ---
const About = () => (
    <div className="container" style={{background:'white', padding:40, borderRadius:12, textAlign:'center'}}>
        <h1>Hakkımızda</h1>
        <p style={{fontSize: '1.2rem', color:'#555'}}>ModaStore olarak 2024 yılından beri en trend ürünleri sizlerle buluşturuyoruz.</p>
    </div>
);

const Contact = () => (
    <div className="container" style={{background:'white', padding:40, borderRadius:12, textAlign:'center'}}>
        <h1>İletişim</h1>
        <div style={{fontSize: '1.2rem', color:'#555', marginTop: 20}}>
            <p>📍 Adres: İstanbul, Türkiye</p>
            <p>📞 Tel: +90 555 123 45 67</p>
            <p>📧 Email: info@modastore.com</p>
        </div>
    </div>
);

// --- NAVBAR (Linkler Eklendi) ---
const Navbar = ({ cartCount, onSearch, user, onLogout }) => {
  return (
    <nav>
      <div className="logo"><Link to="/">🧥 ModaStore</Link></div>
      <div className="search-bar"><input type="text" placeholder="Ürün ara..." onChange={(e) => onSearch(e.target.value)} /></div>
      <div className="menu">
        <Link to="/">Ana Sayfa</Link>
        <Link to="/about">Hakkımızda</Link>
        <Link to="/contact">İletişim</Link>
        <Link to="/cart">🛒 Sepet ({cartCount})</Link>
        
        {user ? (
            <>
                {user.role === 'admin' && <Link to="/admin" className="tab-btn-admin">Yönetim</Link>}
                <button onClick={onLogout} className="logout-btn">Çıkış</button>
            </>
        ) : (
            <>
                <Link to="/login">Giriş</Link>
                <Link to="/register">Kayıt</Link>
            </>
        )}
      </div>
    </nav>
  );
};

// --- AUTH SAYFALARI ---
const Register = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const navigate = useNavigate();
    const handleRegister = async (e) => { e.preventDefault(); try { await axios.post('/api/register', form); alert("Kayıt Başarılı!"); navigate('/login'); } catch (err) { alert("Hata!"); } };
    return (<div className="container auth-container"><h2>Kayıt Ol</h2><form onSubmit={handleRegister} className="admin-form"><input placeholder="Kullanıcı Adı" onChange={e => setForm({...form, username: e.target.value})} required/><input type="password" placeholder="Şifre" onChange={e => setForm({...form, password: e.target.value})} required/><button className="save-btn">Kayıt Ol</button></form></div>);
};

const Login = ({ setUser }) => {
    const [form, setForm] = useState({ username: '', password: '' });
    const navigate = useNavigate();
    const handleLogin = async (e) => { 
        e.preventDefault(); 
        try { 
            const res = await axios.post('/api/login', form); 
            const userData = { username: res.data.username, role: res.data.role }; 
            localStorage.setItem("user", JSON.stringify(userData)); 
            localStorage.setItem("token", res.data.token); 
            setUser(userData); 
            alert("Hoşgeldin " + res.data.username); 
            if(res.data.role === 'admin') navigate('/admin'); else navigate('/'); 
        } catch (err) { alert("Hatalı giriş!"); } 
    };
    return (<div className="container auth-container"><h2>Giriş Yap</h2><form onSubmit={handleLogin} className="admin-form"><input placeholder="Kullanıcı Adı" onChange={e => setForm({...form, username: e.target.value})} required/><input type="password" placeholder="Şifre" onChange={e => setForm({...form, password: e.target.value})} required/><button className="save-btn">Giriş Yap</button></form></div>);
};

// --- DETAY VE SEPET ---
const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => { axios.get(`/api/products/${id}`).then(res => setProduct(res.data)); }, [id]);
  if (!product) return <div className="container">Yükleniyor...</div>;
  return (
    <div className="container detail-container">
      <div className="detail-left"><img src={product.img}/></div>
      <div className="detail-right">
        <h1>{product.name}</h1>
        <p className="detail-desc">Bu harika ürün %100 pamuktan üretilmiştir. Mevsimlik kullanım için uygundur. Stoklarla sınırlıdır, kaçırmayın!</p>
        <p className="detail-price">{product.price} TL</p>
        <button className="buy-btn big-btn" onClick={() => addToCart(product)}>Sepete Ekle</button>
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart }) => {
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    return (
        <div className="container">
            <h2>🛒 Alışveriş Sepetim</h2>
            {cart.length === 0 ? <p>Sepetiniz boş.</p> : (
                <div className="cart-list">
                    {cart.map((item, i) => (
                        <div key={i} className="cart-item">
                            <div className="cart-info">
                                <img src={item.img} alt=""/>
                                <div><h4>{item.name}</h4><p>{item.price} TL</p></div>
                            </div>
                            <button onClick={() => removeFromCart(i)} className="delete-btn delete-action">Sil</button>
                        </div>
                    ))}
                    <div className="cart-total"><h3>Toplam Tutar: {total} TL</h3><button className="save-btn" style={{marginTop:10}}>Ödemeyi Tamamla</button></div>
                </div>
            )}
        </div>
    );
};

// --- ADMIN PANELI (Aynı) ---
// --- TAMİR EDİLMİŞ ADMIN PANELİ ---
const Admin =()=> {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form State
  const [form, setForm] = useState({ name: '', price: '', size: '', img: '' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Verileri Çek
  useEffect(() => { 
      if(activeTab === 'products') fetchProducts(); 
      if(activeTab === 'users') fetchUsers(); 
  }, [activeTab]);

  const fetchProducts = async () => { const res = await axios.get('/api/products'); setProducts(res.data); };
  const fetchUsers = async () => { const res = await axios.get('/api/users'); setUsers(res.data); };

  // Kullanıcı Yetkisi
  const toggleRole = async (u) => { 
      const nr = u.role === 'admin' ? 'user' : 'admin'; 
      if(window.confirm(`Yetki değişsin mi?`)) { 
          await axios.put(`/api/users/${u._id}/role`, {role: nr}); 
          fetchUsers(); 
      }
  };

  // Dosya Okuma
  const handleFileChange = (e) => { 
      const file = e.target.files[0]; 
      if(file){ 
          const reader = new FileReader(); 
          reader.onloadend = () => setForm({...form, img: reader.result}); 
          reader.readAsDataURL(file); 
      }
  };

  // --- KRİTİK DÜZELTME BURADA ---
  const handleSubmit = async (e) => { 
      e.preventDefault(); 
      
      // 1. KONTROL: İsim, Fiyat veya Beden boşsa İZİN VERME!
      if (!form.name || !form.price || !form.size) {
          return alert("❌ Lütfen İsim, Fiyat ve Beden alanlarını doldurun!");
      }

      // 2. KONTROL: Resim yoksa o sevdiğin "Resim Yok" görselini koy
      const varsayilanResim = "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg";
      const gonderilecekUrun = { 
          ...form, 
          img: form.img ? form.img : varsayilanResim 
      };

      try {
          if (editMode) { 
              await axios.put(`/api/products/${editId}`, gonderilecekUrun); 
              alert("✅ Ürün Güncellendi");
          } else { 
              await axios.post('/api/products', gonderilecekUrun); 
              alert("✅ Ürün Eklendi");
          } 
          
          // Temizlik
          setForm({ name: '', price: '', size: '', img: '' }); 
          document.getElementById('fileInput').value = ""; 
          fetchProducts();
      } catch (err) {
          alert("Bir hata oluştu!");
      }
  };

  const handleDelete = async (id) => { 
      if(window.confirm("Silinsin mi?")) { 
          await axios.delete(`/api/products/${id}`); 
          fetchProducts(); 
      } 
  };

  const handleEdit = (p) => { 
      setEditMode(true); 
      setEditId(p._id); 
      setForm({ name: p.name, price: p.price, size: p.size, img: p.img }); 
      window.scrollTo(0, 0); 
  };

  return (
    <div className="container">
       <div className="admin-header">
           <h2>🛠️ Yönetim Paneli</h2>
           <div>
               <button className={activeTab==='products'?'tab-btn active':'tab-btn'} onClick={()=>setActiveTab('products')}>Ürünler</button>
               <button className={activeTab==='users'?'tab-btn active':'tab-btn'} onClick={()=>setActiveTab('users')}>Kullanıcılar</button>
           </div>
       </div>

       {activeTab === 'products' && (
           <>
            <div className="admin-form-card">
                <form onSubmit={handleSubmit} className="admin-form">
                    <input placeholder="Ürün Adı *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                    <input placeholder="Fiyat (TL) *" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
                    <input placeholder="Beden (S, M, L) *" value={form.size} onChange={e=>setForm({...form,size:e.target.value})}/>
                    <div style={{border:'1px dashed #ccc',padding:10}}>
                        <label>Fotoğraf (Opsiyonel):</label>
                        <input id="fileInput" type="file" onChange={handleFileChange}/>
                        <input placeholder="Veya URL" value={form.img} onChange={e=>setForm({...form,img:e.target.value})}/>
                    </div>
                    <button className="save-btn">{editMode?'Güncelle':'Ekle'}</button>
                </form>
            </div>
            <table className="admin-table">
                <thead><tr><th>Resim</th><th>İsim</th><th>Fiyat</th><th>İşlem</th></tr></thead>
                <tbody>{products.map(p=>(<tr key={p._id}><td><img src={p.img} width="50" style={{borderRadius:5}}/></td><td>{p.name}</td><td>{p.price} TL</td><td><button onClick={()=>handleEdit(p)} className="edit-action">Düzelt</button><button onClick={()=>handleDelete(p._id)} className="delete-action">Sil</button></td></tr>))}</tbody>
            </table>
           </>
       )}

       {activeTab === 'users' && (
           <table className="admin-table">
               <thead><tr><th>Kullanıcı</th><th>Rol</th><th>İşlem</th></tr></thead>
               <tbody>{users.map(u=>(<tr key={u._id}><td>{u.username}</td><td><span className={u.role==='admin'?'badge-admin':'badge-user'}>{u.role.toUpperCase()}</span></td><td>{u.username!=='admin' && (<button onClick={()=>toggleRole(u)} className={u.role==='admin'?'delete-action':'save-btn'} style={{padding:'5px 10px', fontSize:'0.8rem'}}>{u.role==='admin'?'Yetkisini Al':'Admin Yap'}</button>)}</td></tr>))}</tbody>
           </table>
       )}
    </div>
  );
};

// --- ANA UYGULAMA ---
const Home=({products, addToCart})=>(<div className="container"><div className="product-grid">{products.map(p=>(<div key={p._id} className="card"><Link to={`/product/${p._id}`}><img src={p.img}/><div className="card-body"><h3>{p.name}</h3><p className="price">{p.price} TL</p></div></Link><button className="buy-btn" onClick={()=>addToCart(p)}>Sepete Ekle</button></div>))}</div></div>);

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(() => { const s = localStorage.getItem("sepetim"); return s ? JSON.parse(s) : []; });
  const [user, setUser] = useState(() => { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; });

  useEffect(() => { axios.get('/api/products').then(res => { setProducts(res.data); setFilteredProducts(res.data); }); }, []);
  useEffect(() => { localStorage.setItem("sepetim", JSON.stringify(cart)); }, [cart]);
  const handleSearch = (t) => { const f = products.filter(i => i.name.toLowerCase().includes(t.toLowerCase())); setFilteredProducts(f); };
  const addToCart = (p) => { setCart([...cart, p]); alert("Eklendi!"); };
  const removeFromCart = (i) => { setCart(cart.filter((_, index) => index !== i)); };
  const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null); window.location.href = "/"; }

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cart.length} onSearch={handleSearch} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home products={filteredProducts} addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;