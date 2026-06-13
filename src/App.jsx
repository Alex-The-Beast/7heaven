import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Apple, ArrowLeft, BarChart3, Bike, Boxes, Carrot, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, Clock, Coffee, Cookie,
  CreditCard, Download, Droplets, Gift, Home, LayoutDashboard, Lock, LogOut, MapPin, Menu, Milk, Minus, PackageCheck, Phone,
  FileText, Info, Plus, ReceiptText, Search, Share2, ShieldCheck, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles, Star, Trash2, Truck, User, Wheat, X,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { categories } from './data/categories';
import { products as catalog } from './data/products';
import { useCart } from './context/CartContext';
import { useAdmin } from './context/AdminContext';

const icons = { ShoppingBasket, Carrot, Apple, Milk, Wheat, Droplets, Coffee, Cookie, Home, Sparkles };
const statusLabels = { pending: 'Pending', processing: 'Processing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const statusClasses = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  out_for_delivery: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};
const chartData = [
  { day: 'Mon', revenue: 54000, orders: 148 }, { day: 'Tue', revenue: 62000, orders: 166 },
  { day: 'Wed', revenue: 58000, orders: 159 }, { day: 'Thu', revenue: 76000, orders: 192 },
  { day: 'Fri', revenue: 82000, orders: 218 }, { day: 'Sat', revenue: 112000, orders: 286 },
  { day: 'Sun', revenue: 99000, orders: 242 },
];
const page = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };
const imageFallback = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22500%22 viewBox=%220 0 500 500%22%3E%3Crect width=%22500%22 height=%22500%22 rx=%2232%22 fill=%22%23fff7ed%22/%3E%3Ccircle cx=%22250%22 cy=%22218%22 r=%2278%22 fill=%22%23F38020%22 opacity=%220.18%22/%3E%3Cpath d=%22M160 322h180l-22 64H182z%22 fill=%22%23F38020%22 opacity=%220.35%22/%3E%3Cpath d=%22M202 164h96l18 158H184z%22 fill=%22%23F38020%22 opacity=%220.72%22/%3E%3Ctext x=%22250%22 y=%22432%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2230%22 font-weight=%22700%22 fill=%22%23C85F08%22%3E7Heaven%3C/text%3E%3C/svg%3E';

function handleImageError(event) {
  if (event.currentTarget.src !== imageFallback) {
    event.currentTarget.src = imageFallback;
  }
}

function formatPrice(value) {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function Toast() {
  const { toast } = useCart();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float">
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Navbar() {
  const { cartCount, setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const accountRef = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null');
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null'));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('sevenHeavenAuthChanged', syncUser);
    return () => window.removeEventListener('sevenHeavenAuthChanged', syncUser);
  }, []);
  useEffect(() => {
    if (!accountOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [accountOpen]);
  const handleLogin = (mobile) => {
    const nextUser = { mobile };
    localStorage.setItem('sevenHeavenUser', JSON.stringify(nextUser));
    setUser(nextUser);
    window.dispatchEvent(new Event('sevenHeavenAuthChanged'));
    setLoginOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('sevenHeavenUser');
    setUser(null);
    window.dispatchEvent(new Event('sevenHeavenAuthChanged'));
    setAccountOpen(false);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(location.pathname === '/products' ? params.get('q') || '' : '');
  }, [location.pathname, location.search]);
  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="brand-logo shrink-0" aria-label="7Heaven home">
          <span className="brand-logo-mark">7</span>
          <span className="brand-logo-text">Heaven</span>
        </Link>
        <div className="hidden">
          <span className="size-2 animate-pulse rounded-full bg-primary" /> <MapPin size={16} /> Patna, Bihar · 20 min
        </div>
        <div className="hidden min-w-[190px] flex-col leading-tight md:flex">
          <span className="font-display text-xs font-bold text-[#2f235d]">Delivery in 15 Mins</span>
          <button className="mt-1 flex max-w-[190px] items-center gap-1 text-center  font-normal text-xs text-ink">
            Home <span className="truncate  text-muted">- Patna, Bihar, Boring Road...</span> <ChevronDown size={13} className="shrink-0" />
          </button>
        </div>
        <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30323d]" size={20} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-12 w-full rounded-xl border border-[#dfe3ea] bg-white py-3 pl-12 pr-4 text-sm font-medium text-ink outline-none transition placeholder:text-[#3d4252] focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder='Search for "cheese slices"' />
        </form>
          {user ? (
            <div ref={accountRef} className="relative block">
              <button onClick={() => setAccountOpen((value) => !value)} className="flex min-w-10 flex-col items-center gap-1 text-xs font-semibold text-ink transition sm:min-w-14" title={user.mobile}>
                <User size={23} strokeWidth={2.1} />
                <span className="hidden sm:block">Profile</span>
              </button>
              <AccountDropdown open={accountOpen} user={user} onClose={() => setAccountOpen(false)} onLogout={handleLogout} />
            </div>
        ) : (
          <button onClick={() => setLoginOpen(true)} className="rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark sm:px-5 sm:py-3 sm:text-sm sm:font-extrabold">
            Login
          </button>
        )}
        <button onClick={() => setCartOpen(true)} className="relative flex min-w-14 flex-col items-center gap-1 text-xs font-semibold text-ink transition ">
          <span className="relative">
            <ShoppingCart size={25} strokeWidth={2.1} />
            {cartCount > 0 && <motion.span animate={{ scale: [1, 1.18, 1] }} className="absolute -right-4 -top-3 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">{cartCount > 99 ? '99+' : cartCount}</motion.span>}
          </span>
          <span>Cart</span>
        </button>
      </div>
    </header>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
    </>
  );
}

function LoginModal({ open, onClose, onLogin }) {
  const [mobile, setMobile] = useState('');
  const cleanMobile = mobile.replace(/\D/g, '').slice(0, 10);
  const canSubmit = cleanMobile.length === 10;
  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onLogin(cleanMobile);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4 backdrop-blur-sm">
          <motion.form onSubmit={submit} initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.98 }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-float">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Login</h2>
                <p className="mt-1 text-sm text-muted">Enter mobile number to continue.</p>
              </div>
              <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl bg-bg"><X size={18} /></button>
            </div>
            <label className="mt-6 block text-sm font-bold text-ink">Mobile number</label>
            <div className="mt-2 flex rounded-xl border border-line bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <span className="border-r border-line px-4 py-3 text-sm font-bold text-muted">+91</span>
              <input value={cleanMobile} onChange={(event) => setMobile(event.target.value)} inputMode="numeric" placeholder="98765 43210" className="min-w-0 flex-1 rounded-r-xl px-4 py-3 text-sm font-semibold outline-none" />
            </div>
            <button disabled={!canSubmit} className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-white transition hover:bg-primary-dark disabled:bg-gray-300">Continue</button>
            <p className="mt-4 text-center text-xs leading-5 text-muted">By continuing, you agree to receive demo OTP updates from 7Heaven.</p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AccountDropdown({ open, user, onClose, onLogout }) {
  const menu = [
    { label: 'My Orders', href: '/account?tab=orders', icon: ReceiptText },
    { label: 'Saved Addresses', href: '/account?tab=addresses', icon: MapPin },
    { label: 'My Prescriptions', href: '/account?tab=prescriptions', icon: FileText },
    { label: 'E-Gift Cards', href: '/account?tab=gift-cards', icon: Gift },
    { label: "FAQ's", href: '/account?tab=faqs', icon: Info },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 rounded-sm bg-white py-5 shadow-float ring-1 ring-line">
          <div className="px-5 pb-4">
            <h3 className="font-display text-lg font-extrabold text-[#4b5565]">My Account</h3>
            <p className="mt-1 text-sm text-[#4b5565]">{user.mobile}</p>
          </div>
          <div className="space-y-1">
            {menu.map(({ label, href, icon: Icon }) => (
              <Link key={label} to={href} onClick={onClose} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-[#4b5565] hover:bg-bg hover:text-primary">
                <Icon size={17} /> {label}
              </Link>
            ))}
            <button onClick={onLogout} className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-[#4b5565] hover:bg-bg hover:text-primary">
              <LogOut size={17} /> Log Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroBanner() {
  const slides = [
    { title: 'Nourish your home with Earth\'s finest', highlight: 'Earth\'s finest', copy: 'Fresh, organic groceries delivered from local farms to your doorstep. Quality you can taste, convenience you deserve.', tag: 'Farm-Fresh & Organic', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90' },
    { title: 'Daily dairy, bakery and breakfast essentials', highlight: 'breakfast essentials', copy: 'Milk, bread, eggs, butter and morning staples restocked daily and delivered before your kettle whistles.', tag: 'Morning Run Ready', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1800&q=90' },
    { title: 'Save more on pantry staples this week', highlight: 'pantry staples', copy: 'Rice, dal, oils, snacks and household picks with smart deals for every family basket.', tag: 'Flat Rs 50 OFF - FRESH50', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1800&q=90' },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[active];
  const titleParts = slide.title.split(slide.highlight);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative min-h-[340px] overflow-hidden rounded-[24px] bg-[#102719] p-6 text-white md:min-h-[460px] md:p-12 lg:p-14">
        <AnimatePresence mode="wait">
          <motion.img key={slide.image} src={slide.image} alt="" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c2819]/95 via-[#0c2819]/72 to-[#0c2819]/12" />
        <div className="absolute inset-0 bg-black/10" />
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -34 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="relative z-10 flex min-h-[292px] max-w-2xl flex-col justify-center md:min-h-[352px]">
            <div className="mb-5 inline-flex w-max items-center gap-2 rounded-full bg-[#f59e0b]/20 px-4 py-2 text-xs font-bold text-[#ffbd73] backdrop-blur md:text-sm">
              <Sparkles size={16} /> {slide.tag}
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-sm font-bold backdrop-blur">Live demo ready · Blinkit style flow</div>
            <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl">
              {titleParts[0]}<span className="text-[#ffbd73]">{slide.highlight}</span>{titleParts[1]}
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/86 md:text-lg">{slide.copy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-float transition hover:bg-orange-500 md:text-base">Shop Now <ChevronDown className="-rotate-90" size={18} /></a>
              <a href="#mega-categories" className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18 md:text-base">Browse Categories</a>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-6 left-6 z-10 hidden gap-2 sm:flex md:left-16">
          {slides.map((_, index) => <button aria-label={`Show slide ${index + 1}`} key={index} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? 'w-10 bg-accent' : 'w-2 bg-white/55'}`} />)}
        </div>
      </div>
    </section>
  );
}

const megaCategories = [
  { label: 'Paan Corner', category: 'personal', image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=320&q=80' },
  { label: 'Dairy, Bread & Eggs', category: 'dairy', image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=320&q=80' },
  { label: 'Fruits & Vegetables', category: 'vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=320&q=80' },
  { label: 'Cold Drinks & Juices', category: 'beverages', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=320&q=80' },
  { label: 'Snacks & Munchies', category: 'snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=320&q=80' },
  { label: 'Breakfast & Instant Food', category: 'grains', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=320&q=80' },
  { label: 'Sweet Tooth', category: 'snacks', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=320&q=80' },
  { label: 'Bakery & Biscuits', category: 'snacks', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=320&q=80' },
  { label: 'Tea, Coffee & Milk Drinks', category: 'beverages', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80' },
  { label: 'Atta, Rice & Dal', category: 'grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=320&q=80' },
  { label: 'Masala, Oil & More', category: 'oils', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=320&q=80' },
  { label: 'Sauces & Spreads', category: 'snacks', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=320&q=80' },
  { label: 'Chicken, Meat & Fish', category: 'all', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=320&q=80' },
  { label: 'Organic & Healthy Living', category: 'fruits', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=320&q=80' },
  { label: 'Baby Care', category: 'personal', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=320&q=80' },
  { label: 'Pharma & Wellness', category: 'personal', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=320&q=80' },
  { label: 'Cleaning Essentials', category: 'household', image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=320&q=80' },
  { label: 'Home & Office', category: 'household', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=320&q=80' },
  { label: 'Personal Care', category: 'personal', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=320&q=80' },
  { label: 'Pet Care', category: 'household', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=320&q=80' },
];

function MegaCategoryGrid({ active, setActive }) {
  const navigate = useNavigate();
  const chooseCategory = (category) => {
    setActive(category);
    navigate(`/category/${category}`);
  };

  return (
    <section id="mega-categories" className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.025 } } }} className="no-scrollbar grid grid-flow-col grid-rows-2 auto-cols-[92px] gap-x-4 gap-y-5 overflow-x-auto rounded-[20px] bg-white px-3 py-5 shadow-card sm:grid-flow-row sm:grid-rows-none sm:grid-cols-3 sm:gap-y-6 sm:overflow-visible sm:py-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
        {megaCategories.map((item) => (
          <motion.button
            key={item.label}
            variants={{ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }}
            onClick={() => chooseCategory(item.category)}
            className={`group text-center transition ${active === item.category ? 'scale-[1.02]' : ''}`}
          >
            <div className={`mx-auto grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-2xl bg-[#f1f7ff] p-2 transition group-hover:-translate-y-1 group-hover:shadow-card ${active === item.category ? 'ring-2 ring-primary' : ''}`}>
              <img src={item.image || imageFallback} alt="" onError={handleImageError} className="h-full w-full rounded-xl object-cover mix-blend-multiply transition duration-300 group-hover:scale-110" />
            </div>
            <div className="mx-auto mt-3 max-w-28 text-sm font-semibold leading-5 text-[#3f3f46]">{item.label}</div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}

function CategoryStrip({ active, setActive }) {
  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="no-scrollbar mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-5">
      {categories.map((cat) => {
        const Icon = icons[cat.icon] || ShoppingBasket;
        return (
          <motion.button variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }} key={cat.id} onClick={() => setActive(cat.id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition ${active === cat.id ? 'border-primary bg-primary text-white shadow-card' : 'border-line bg-white text-ink hover:border-primary'}`}>
            <Icon size={18} /> {cat.name}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function DealTimer() {
  const [left, setLeft] = useState(4 * 3600 + 19 * 60 + 40);
  useEffect(() => {
    const timer = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const h = String(Math.floor(left / 3600)).padStart(2, '0');
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return <span className="rounded-full bg-red-500 px-3 py-1 font-mono text-sm font-bold text-white">{h}:{m}:{s}</span>;
}

function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find((entry) => entry.id === product.id);
  const low = product.stock > 0 && product.stock < 20;
  return (
    <motion.article whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(28,168,92,0.15)' }} className="group relative overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
      {product.stock <= 0 && <div className="absolute left-0 top-4 z-10 bg-danger px-3 py-1 text-xs font-bold text-white">OUT OF STOCK</div>}
      {product.discount > 12 && <div className="absolute right-3 top-3 z-10 rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-bold text-white">{product.discount}% OFF</div>}
      <Link to={`/product/${product.id}`} className="block">
        <div className="h-40 overflow-hidden bg-bg">
          <img src={product.image || imageFallback} alt={product.name} onError={handleImageError} className={`h-full w-full object-cover transition duration-500 group-hover:scale-110 ${product.stock <= 0 ? 'grayscale' : ''}`} />
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-primary">{product.unit}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted"><Star size={14} className="fill-warning text-warning" /> {product.rating} ({product.ratingCount})</span>
        </div>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="min-h-12 text-sm font-bold leading-snug text-ink transition hover:text-primary md:text-base">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted">{product.description}</p>
        </Link>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-lg font-bold text-ink">{formatPrice(product.price)}</div>
            <div className="font-mono text-xs text-muted line-through">{formatPrice(product.mrp)}</div>
          </div>
          {item ? (
            <div className="flex items-center rounded-xl bg-primary text-white">
              <button onClick={() => updateQuantity(product.id, item.qty - 1)} className="p-2"><Minus size={16} /></button>
              <span className="w-8 text-center font-mono font-bold">{item.qty}</span>
              <button onClick={() => updateQuantity(product.id, item.qty + 1)} className="p-2"><Plus size={16} /></button>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => addToCart(product)} disabled={product.stock <= 0} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300">Add</motion.button>
          )}
        </div>
        {low && <div className="mt-3 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-warning">Only {product.stock} left</div>}
      </div>
    </motion.article>
  );
}

function ShelfProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find((entry) => entry.id === product.id);
  return (
    <article className="group flex h-[330px] w-[202px] shrink-0 flex-col rounded-xl border border-line bg-white p-3 shadow-[0_1px_8px_rgba(16,24,40,0.06)] transition hover:-translate-y-0.5 hover:shadow-card">
      <Link to={`/product/${product.id}`} className="block">
        <div className="grid h-36 place-items-center rounded-lg bg-white">
          <img src={product.image || imageFallback} alt={product.name} onError={handleImageError} className="max-h-32 w-full object-contain transition duration-300 group-hover:scale-105" />
        </div>
        <div className="mt-2 inline-flex w-max items-center gap-1 rounded-md bg-bg px-1.5 py-1 text-[10px] font-bold text-ink">
          <Clock size={11} className="text-primary" /> 12 MINS
        </div>
        <h3 className="mt-2 min-h-11 text-sm font-bold leading-5 text-ink line-clamp-2">{product.name}</h3>
        <p className="mt-3 text-sm font-medium text-muted">{product.unit}</p>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-3">
        <span className="font-mono text-sm font-extrabold text-ink">{formatPrice(product.price)}</span>
        {item ? (
          <div className="flex h-9 items-center rounded-lg bg-primary text-white">
            <button onClick={() => updateQuantity(product.id, item.qty - 1)} className="px-2"><Minus size={14} /></button>
            <span className="w-6 text-center font-mono text-sm font-bold">{item.qty}</span>
            <button onClick={() => updateQuantity(product.id, item.qty + 1)} className="px-2"><Plus size={14} /></button>
          </div>
        ) : (
          <button onClick={() => addToCart(product)} disabled={product.stock <= 0} className="h-9 min-w-20 rounded-lg border border-primary bg-white px-4 text-sm font-extrabold text-primary transition hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-400">
            ADD
          </button>
        )}
      </div>
    </article>
  );
}

function ProductShelf({ title, products, onSeeAll }) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updateScrollButtons = () => {
    const node = scrollerRef.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 8);
  };
  const scrollPrev = () => scrollerRef.current?.scrollBy({ left: -680, behavior: 'smooth' });
  const scrollNext = () => scrollerRef.current?.scrollBy({ left: 680, behavior: 'smooth' });

  useEffect(() => {
    updateScrollButtons();
    const node = scrollerRef.current;
    if (!node) return undefined;
    node.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      node.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [products.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">{title}</h2>
        <button onClick={onSeeAll} className="shrink-0 text-sm font-extrabold text-primary hover:text-primary-dark md:text-base">see all</button>
      </div>
      <div className="relative">
        <div ref={scrollerRef} onScroll={updateScrollButtons} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {products.map((product) => <ShelfProductCard key={`${title}-${product.id}`} product={product} />)}
        </div>
        {canScrollLeft && (
          <button onClick={scrollPrev} className="absolute left-[-18px] top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-float ring-1 ring-line transition hover:text-primary lg:grid" aria-label={`Scroll ${title} left`}>
            <ChevronLeft size={24} />
          </button>
        )}
        {canScrollRight && (
          <button onClick={scrollNext} className="absolute right-[-18px] top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-float ring-1 ring-line transition hover:text-primary lg:grid" aria-label={`Scroll ${title}`}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
}

function ProductGrid({ products, title = 'All Groceries' }) {
  const [sort, setSort] = useState('popularity');
  const sorted = [...products].sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'discount' ? b.discount - a.discount : b.popularity - a.popularity);
  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
          <p className="text-sm text-muted">{sorted.length} products · fresh stock updated today</p>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold outline-none">
          <option value="popularity">Popularity</option>
          <option value="low">Price Low-High</option>
          <option value="discount">Discount</option>
        </select>
      </div>
      {sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center shadow-card">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-primary"><Search size={24} /></div>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">No products found</h3>
          <p className="mt-2 text-sm text-muted">Try searching milk, atta, rice, snacks, oil, fruits, or household essentials.</p>
        </div>
      )}
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((product) => <motion.div key={product.id} variants={{ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } }}><ProductCard product={product} /></motion.div>)}
      </motion.div>
    </section>
  );
}

function CategoryListingCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find((entry) => entry.id === product.id);
  return (
    <article className="group min-w-0">
      <Link to={`/product/${product.id}`} className="relative grid h-32 place-items-center overflow-hidden rounded-xl border border-line bg-white p-3 transition group-hover:shadow-card sm:h-44 sm:p-4">
        {product.discount > 10 && <span className="absolute left-2 top-0 rounded-b-md bg-blue-600 px-1.5 py-1 text-[9px] font-extrabold leading-3 text-white sm:left-3 sm:px-2 sm:text-[10px]">{product.discount}%<br />OFF</span>}
          <img src={product.image || imageFallback} alt={product.name} onError={handleImageError} className="max-h-24 w-auto max-w-[78%] object-contain transition duration-300 group-hover:scale-105 sm:max-h-36 sm:max-w-[86%]" />
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2 sm:mt-3 sm:gap-3">
        <div className="min-w-0">
          <div className="inline-flex rounded-md bg-primary px-1.5 py-1 font-mono text-sm font-extrabold text-white sm:px-2 sm:text-base">{formatPrice(product.price)}</div>
          <span className="ml-1 font-mono text-xs text-muted line-through sm:ml-2 sm:text-sm">{formatPrice(product.mrp)}</span>
          <div className="mt-1 text-[11px] font-bold text-green-700 sm:text-xs sm:font-extrabold">Rs {Math.max(0, product.mrp - product.price)} OFF</div>
        </div>
        {item ? (
          <div className="flex h-8 shrink-0 items-center rounded-lg bg-primary text-white sm:h-10">
            <button onClick={() => updateQuantity(product.id, item.qty - 1)} className="px-2"><Minus size={14} /></button>
            <span className="w-5 text-center font-mono text-xs font-bold sm:w-6 sm:text-sm">{item.qty}</span>
            <button onClick={() => updateQuantity(product.id, item.qty + 1)} className="px-2"><Plus size={14} /></button>
          </div>
        ) : (
          <button onClick={() => addToCart(product)} disabled={product.stock <= 0} className="h-8 shrink-0 rounded-lg border border-pink-500 bg-white px-3 text-xs font-extrabold text-pink-600 transition hover:bg-pink-50 disabled:border-gray-300 disabled:text-gray-400 sm:h-10 sm:px-4 sm:text-sm">ADD</button>
        )}
      </div>
      <Link to={`/product/${product.id}`} className="mt-3 block">
        <h3 className="min-h-9 text-xs font-bold leading-4 text-ink line-clamp-2 hover:text-primary sm:min-h-10 sm:text-sm sm:leading-5">{product.name}</h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">1 pack ({product.unit})</p>
        <span className="mt-2 inline-block bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 sm:text-xs">{product.category === 'grains' ? 'High Fiber' : 'Fresh Pick'}</span>
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-700"><Star size={13} className="fill-green-600 text-green-600" /> {product.rating} ({product.ratingCount})</div>
      </Link>
    </article>
  );
}

function CategoryListingPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { products: adminProducts } = useAdmin();
  const [active, setActive] = useState(category || 'all');
  const [activeLabel, setActiveLabel] = useState('');
  const activeMeta = megaCategories.find((item) => item.label === activeLabel) || megaCategories.find((item) => item.category === active) || megaCategories[0];
  const products = (active === 'all' ? adminProducts : adminProducts.filter((product) => product.category === active));
  const chips = ['Brand', 'Daily Good', 'Deepak', 'Organic Tattva', 'Pansari', '24 Mantra', 'Price'];

  useEffect(() => {
    setActive(category || 'all');
    setActiveLabel(megaCategories.find((item) => item.category === (category || 'all'))?.label || '');
  }, [category]);

  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex min-w-0 items-center gap-2 overflow-hidden text-xs font-medium text-muted sm:mb-7 sm:gap-3 sm:text-sm">
          <Link to="/" className="shrink-0 text-[#33415c] hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <span className="truncate">{activeMeta?.label || 'Groceries'}</span>
          <ChevronRight size={16} />
          <span className="truncate font-bold text-ink">{active === 'grains' ? 'Millets & Other Flours' : activeMeta?.label}</span>
        </div>
        <div className="grid gap-8 lg:grid-cols-[285px_1fr]">
          <aside className="hidden border-r border-line lg:block">
            <div className="sticky top-24">
              {megaCategories.slice(1, 18).map((item) => (
                <button
                  key={`${item.label}-${item.category}`}
                  onClick={() => { setActive(item.category); setActiveLabel(item.label); }}
                  className={`flex w-full items-center gap-5 px-6 py-4 text-left transition ${activeLabel === item.label ? 'border-l-2 border-primary bg-orange-50 text-primary' : 'text-[#596174] hover:bg-bg'}`}
                >
                  <img src={item.image || imageFallback} alt="" onError={handleImageError} className="size-10 rounded-lg object-cover" />
                  <span className="truncate text-sm font-semibold">{item.category === 'grains' && active === item.category ? 'Millets & Other...' : item.label}</span>
                </button>
              ))}
            </div>
          </aside>
          <div>
            <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {megaCategories.slice(1, 18).map((item) => (
                <button
                  key={`mobile-${item.label}-${item.category}`}
                  onClick={() => { setActive(item.category); setActiveLabel(item.label); navigate(`/category/${item.category}`); }}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${activeLabel === item.label || active === item.category ? 'border-primary bg-orange-50 text-primary' : 'border-line bg-white text-[#596174]'}`}
                >
                  <img src={item.image || imageFallback} alt="" onError={handleImageError} className="size-7 rounded-full object-cover" />
                  <span className="max-w-28 truncate">{item.label}</span>
                </button>
              ))}
            </div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl md:text-3xl">
              Buy {active === 'grains' ? 'Millets & Other Flours' : activeMeta?.label} Online
            </h1>
            <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
              <button className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white shadow-sm"><SlidersHorizontal size={19} /></button>
              {chips.map((chip) => (
                <button key={chip} className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-bold text-[#4f5870] shadow-sm">
                  {chip} {['Brand', 'Price'].includes(chip) && <ChevronDown size={15} />}
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-8 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => <CategoryListingCard key={product.id} product={product} />)}
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

function HomePage() {
  const [active, setActive] = useState('all');
  const navigate = useNavigate();
  const { products: adminProducts } = useAdmin();
  const shelves = [
    { title: 'Dairy, Bread & Eggs', category: 'dairy', products: adminProducts.filter((product) => product.category === 'dairy') },
    { title: 'Snacks & Munchies', category: 'snacks', products: adminProducts.filter((product) => product.category === 'snacks') },
    { title: 'Atta, Rice & Dal', category: 'grains', products: adminProducts.filter((product) => product.category === 'grains') },
    { title: 'Fruits & Vegetables', category: 'vegetables', products: adminProducts.filter((product) => ['vegetables', 'fruits'].includes(product.category)) },
    { title: 'Personal & Home Care', category: 'personal', products: adminProducts.filter((product) => ['personal', 'household'].includes(product.category)) },
  ].filter((shelf) => shelf.products.length > 0);
  const showShelf = (category) => {
    setActive(category);
    navigate(`/category/${category}`);
  };
  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit">
      <HeroBanner />
      <MegaCategoryGrid active={active} setActive={setActive} />
      <div className="pt-1">
        {shelves.map((shelf) => <ProductShelf key={shelf.title} title={shelf.title} products={shelf.products} onSeeAll={() => showShelf(shelf.category)} />)}
      </div>
    </motion.main>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const { products: adminProducts } = useAdmin();
  const product = adminProducts.find((item) => item.id === id) || adminProducts[0];
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [unit, setUnit] = useState(product.unit);
  const item = cartItems.find((entry) => entry.id === product.id);
  const similar = adminProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 10);
  const peopleAlsoBought = adminProducts.filter((item) => item.category !== product.category).sort((a, b) => b.popularity - a.popularity).slice(0, 10);
  const gallery = [
    product.image || imageFallback,
    ...adminProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4).map((item) => item.image || imageFallback),
  ];

  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit">
      <section className="mx-auto grid max-w-7xl border-b border-line px-4 py-4 sm:py-8 lg:grid-cols-[1.03fr_1fr] lg:px-6">
        <div className="border-line lg:border-r lg:pr-10">
          <div className="grid min-h-[260px] place-items-center rounded-2xl bg-[#fbf4d7] p-5 sm:min-h-[420px] sm:p-8 md:min-h-[560px]">
            <img src={gallery[activeImage]} alt={product.name} onError={handleImageError} className="max-h-[230px] w-full object-contain sm:max-h-[480px]" />
          </div>
          <div className="relative mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pr-11 sm:gap-3 sm:pr-14">
              {gallery.map((image, index) => (
                <button key={image} onClick={() => setActiveImage(index)} className={`grid size-14 shrink-0 place-items-center rounded-xl border bg-[#fbf4d7] p-1 transition sm:size-20 ${activeImage === index ? 'border-primary ring-1 ring-primary' : 'border-line'}`}>
                  <img src={image} alt="" onError={handleImageError} className="h-full w-full rounded-lg object-cover" />
                </button>
              ))}
            </div>
            <button onClick={() => setActiveImage((value) => (value + 1) % gallery.length)} className="absolute right-0 grid size-9 place-items-center rounded-full bg-white shadow-float ring-1 ring-line sm:size-11">
              <ChevronRight size={21} />
            </button>
          </div>
          <div className="mt-7 sm:mt-10">
          <h2 className="font-display text-base font-extrabold text-ink sm:text-lg">Product Details</h2>
            <div className="mt-4 grid gap-3 text-[13px]">
              <div><span className="font-bold">Type</span><p className="mt-1 text-muted capitalize">{product.category}</p></div>
              <div><span className="font-bold">Description</span><p className="mt-1 max-w-xl leading-6 text-muted">{product.description}</p></div>
              <div><span className="font-bold">Shelf life</span><p className="mt-1 text-muted">Best before 6 months from packaging.</p></div>
            </div>
          </div>
        </div>

        <div className="pt-6 lg:px-12 lg:pt-12">
          <div className="line-clamp-1 text-xs font-semibold text-muted sm:text-[13px]">Home / {product.category} / <span className="text-ink">{product.name}</span></div>
          <h1 className="mt-3 max-w-2xl font-display text-lg font-extrabold leading-tight text-ink sm:mt-4 sm:text-xl md:text-2xl">{product.name}</h1>
          <div className="mt-5 text-sm font-bold text-ink sm:mt-6">Select Unit</div>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
            {[product.unit, product.unit.includes('kg') ? '1 kg' : '150 g'].map((option, index) => (
              <button key={option} onClick={() => setUnit(option)} className={`min-w-24 rounded-xl border px-3 py-3 text-left transition sm:py-4 ${unit === option ? 'border-primary bg-primary/5' : 'border-line bg-bg'}`}>
                <div className="text-[13px] font-semibold text-ink">{option}</div>
                <div className="mt-1 font-mono text-[13px] font-extrabold">{index === 0 ? formatPrice(product.price) : 'Out of stock'}</div>
              </button>
            ))}
          </div>
          <div className="mt-5 text-[13px] font-bold text-muted">{unit}</div>
          <div className="mt-2 flex flex-col gap-4 rounded-2xl bg-white pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5">
            <div>
              <div className="font-mono text-base font-extrabold text-ink sm:text-lg">{formatPrice(product.price)} <span className="text-[12px] font-medium text-muted sm:text-[13px]">MRP <span className="line-through">{formatPrice(product.mrp)}</span></span></div>
              <p className="mt-1 text-xs text-muted">(Inclusive of all taxes)</p>
            </div>
            {item ? (
              <div className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-white sm:h-14 sm:w-auto">
                <button onClick={() => updateQuantity(product.id, item.qty - 1)} className="px-4"><Minus size={18} /></button>
                <span className="w-8 text-center font-mono font-bold">{item.qty}</span>
                <button onClick={() => updateQuantity(product.id, item.qty + 1)} className="px-4"><Plus size={18} /></button>
              </div>
            ) : (
              <button onClick={() => addToCart(product)} className="h-12 w-full rounded-lg bg-primary px-6 text-sm font-extrabold text-white transition hover:bg-primary-dark sm:w-auto sm:text-base">Add to cart</button>
            )}
          </div>

          <div className="mt-9 sm:mt-16">
            <h2 className="font-display text-base font-extrabold text-ink sm:text-lg">Why shop from 7Heaven?</h2>
            <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
              {[
                ['Round The Clock Delivery', 'Get items delivered to your doorstep from nearby dark stores whenever you need them.'],
                ['Best Prices & Offers', 'Smart prices, useful bundles, and offers directly from trusted suppliers.'],
                ['Wide Assortment', 'Choose from daily groceries, personal care, household essentials, snacks and more.'],
              ].map(([title, copy], index) => (
                <div key={title} className="flex gap-3 sm:gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary sm:size-14"><PackageCheck size={22} /></div>
                  <div><h3 className="text-sm font-bold text-ink">{title}</h3><p className="mt-1 max-w-xl text-[13px] leading-5 text-muted">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {similar.length > 0 && <ProductShelf title="Similar products" products={similar} onSeeAll={() => {}} />}
      {peopleAlsoBought.length > 0 && <ProductShelf title="People also bought" products={peopleAlsoBought} onSeeAll={() => {}} />}
    </motion.main>
  );
}

function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, updateQuantity, subtotal, deliveryFee, discount, total, coupon, setCoupon, clearCart, flash } = useCart();
  const { addOrder } = useAdmin();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null'); } catch { return null; }
  });
  const [savedAddress, setSavedAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenAddress') || 'null'); } catch { return null; }
  });
  const mrpTotal = cartItems.reduce((sum, item) => sum + item.mrp * item.qty, 0);
  const savings = Math.max(0, mrpTotal - subtotal + discount);
  const handlingFee = cartItems.length > 0 ? 2 : 0;
  const cartDeliveryFee = cartItems.length > 0 ? 0 : deliveryFee;
  const cartGrandTotal = Math.max(0, subtotal + cartDeliveryFee + handlingFee - discount);
  const rupee = (value) => `₹${value.toLocaleString('en-IN')}`;
  const handleCheckout = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (savedAddress) {
      setPaymentOpen(true);
      return;
    }
    setAddressOpen(true);
  };
  const handleCartLogin = (mobile) => {
    const nextUser = { mobile };
    localStorage.setItem('sevenHeavenUser', JSON.stringify(nextUser));
    setUser(nextUser);
    window.dispatchEvent(new Event('sevenHeavenAuthChanged'));
    setLoginOpen(false);
    if (savedAddress) {
      setPaymentOpen(true);
      return;
    }
    setAddressOpen(true);
  };
  const saveCartAddress = (nextAddress) => {
    localStorage.setItem('sevenHeavenAddress', JSON.stringify(nextAddress));
    setSavedAddress(nextAddress);
    setAddressOpen(false);
    setPaymentOpen(true);
  };
  const placeCartOrder = (method) => {
    const order = {
      id: `ORD-${Math.floor(9000 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'delivered',
      payment: method,
      total,
      address: savedAddress,
      items: cartItems.map((item) => ({ id: item.id, name: item.name, image: item.image, unit: item.unit, price: item.price, qty: item.qty })),
    };
    const orders = JSON.parse(localStorage.getItem('sevenHeavenOrders') || '[]');
    localStorage.setItem('sevenHeavenOrders', JSON.stringify([order, ...orders]));
    addOrder(order);
    clearCart();
    flash('Order placed and added to history');
    setPaymentOpen(false);
    setCartOpen(false);
    navigate('/account?tab=orders');
  };
  return (
    <>
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#f4f6fb] shadow-float">
            <div className="flex items-center justify-between bg-white px-5 py-5">
              <div className="flex items-center gap-4">
                <button onClick={() => setCartOpen(false)} className="grid size-8 place-items-center text-ink"><ArrowLeft size={22} /></button>
                <h2 className="font-display text-lg font-extrabold text-ink">My Cart</h2>
              </div>
              <button className="flex items-center gap-2 text-sm font-extrabold text-green-700"><Share2 size={17} /> Share</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <div className="mx-auto grid size-24 place-items-center rounded-full bg-emerald-50 text-primary"><ShoppingBasket size={42} /></div>
                  <h3 className="mt-5 font-display text-2xl font-bold">Your cart is empty</h3>
                  <p className="mt-2 text-muted">Add fresh groceries and checkout in three quick steps.</p>
                  <button onClick={() => setCartOpen(false)} className="mt-6 rounded-2xl bg-primary px-6 py-3 font-bold text-white">Shop Now</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto px-4 py-4">
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-100 px-4 py-3 text-sm font-extrabold text-blue-600">
                    <span>Your total savings</span><span>{rupee(savings)}</span>
                  </div>
                  <section className="overflow-hidden rounded-2xl bg-white">
                    <div className="flex gap-4 p-4">
                      <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-bg"><Clock size={30} className="text-primary-dark" /></div>
                      <div><h3 className="font-display text-base font-extrabold text-ink">Delivery in 8 minutes</h3><p className="mt-1 text-sm text-muted">Shipment of {cartItems.length} items</p></div>
                    </div>
                    <div className="divide-y divide-line">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                          <img src={item.image || imageFallback} alt="" onError={handleImageError} className="size-20 shrink-0 rounded-xl border border-line object-cover" />
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-medium leading-5 text-ink">{item.name}</h3>
                            <p className="mt-1 text-sm text-muted">{item.unit}</p>
                            <div className="mt-1 font-mono text-sm font-extrabold text-ink">{rupee(item.price)} {item.mrp > item.price && <span className="ml-1 font-medium text-muted line-through">{rupee(item.mrp)}</span>}</div>
                          </div>
                          <div className="flex h-10 shrink-0 items-center rounded-lg bg-green-700 text-white">
                            <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3"><Minus size={14} /></button>
                            <span className="w-5 text-center font-mono text-sm font-bold">{item.qty}</span>
                            <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3"><Plus size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="mt-5 rounded-2xl bg-[#f4f6fb] p-4">
                    <h3 className="mb-3 font-display text-base font-extrabold text-ink">Bill details</h3>
                    <CartBillLine icon={<ReceiptText size={15} />} label="Items total" value={<><span className="text-muted line-through">{rupee(mrpTotal)}</span> {rupee(subtotal)}</>} chip={savings > 0 ? `Saved ${rupee(savings)}` : ''} />
                    <CartBillLine icon={<Bike size={15} />} label="Delivery charge" value={<><span className="text-muted line-through">₹12</span> <span className="font-extrabold text-blue-600">FREE</span></>} />
                    <CartBillLine icon={<ShoppingBasket size={15} />} label="Handling charge" value={rupee(handlingFee)} />
                    <div className="mt-3 flex items-center justify-between text-base font-extrabold text-ink">
                      <span className="flex items-center gap-1">Grand total <Info size={15} /></span><span>{rupee(cartGrandTotal)}</span>
                    </div>
                  </section>
                  <div className="mt-0 flex items-center justify-between rounded-b-2xl bg-blue-100 px-4 py-3 text-sm font-extrabold text-blue-600">
                    <span>Your total savings</span><span>{rupee(savings)}</span>
                  </div>
                  <section className="mt-4 rounded-2xl bg-white p-5">
                    <h3 className="font-display text-base font-extrabold text-ink">Cancellation Policy</h3>
                    <p className="mt-2 text-sm leading-5 text-muted">Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.</p>
                  </section>
                </div>
                <div className="bg-white p-4">
                  {user && savedAddress && (
                    <div className="mb-3 flex items-start gap-3 rounded-2xl bg-white p-2">
                      <MapPin className="mt-1 text-[#5f6b7a]" size={22} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-extrabold text-ink">Delivering to {savedAddress.label || 'Home'}</h3>
                          <button onClick={() => setAddressOpen(true)} className="text-xs font-extrabold text-green-700">Change</button>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted">{savedAddress.line}, {savedAddress.city}</p>
                      </div>
                    </div>
                  )}
                  <button onClick={handleCheckout} className="flex w-full items-center justify-between rounded-xl bg-green-700 px-4 py-4 text-white shadow-card">
                    <span className="text-left"><span className="block font-mono text-lg font-extrabold">{rupee(cartGrandTotal)}</span><span className="text-xs font-semibold uppercase text-white/80">Total</span></span>
                    <span className="flex items-center gap-1 text-lg font-bold">{user ? 'Proceed To Pay' : 'Login to Proceed'} <ChevronRight size={22} /></span>
                  </button>
                </div>
              </>
            )}
            </motion.aside>
            {paymentOpen && savedAddress && (
              <motion.aside initial={{ x: 36, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 36, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="fixed right-0 top-0 z-[60] h-full w-full max-w-md overflow-auto bg-[#eef1f7] shadow-float">
                <PaymentOptionsScreen total={total} address={savedAddress} onBack={() => setPaymentOpen(false)} onChangeAddress={() => setAddressOpen(true)} onPlaceOrder={placeCartOrder} />
              </motion.aside>
            )}
            {addressOpen && (
              <motion.aside initial={{ x: 36, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 36, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="fixed right-0 top-0 z-[70] h-full w-full max-w-md overflow-auto bg-white shadow-float">
                <DeliveryAddressForm address={savedAddress} onBack={() => setAddressOpen(false)} onSave={saveCartAddress} />
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleCartLogin} />
    </>
  );
}

function SummaryLine({ label, value, negative, free }) {
  return <div className="mb-2 flex justify-between text-sm"><span className="text-muted">{label}</span><span className="font-mono font-bold">{free ? 'FREE' : `${negative ? '- ' : ''}${formatPrice(value)}`}</span></div>;
}

function CartBillLine({ icon, label, value, chip }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-ink">
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        <span>{label}</span>
        <Info size={14} className="shrink-0" />
        {chip && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">{chip}</span>}
      </span>
      <span className="shrink-0 font-mono font-medium">{value}</span>
    </div>
  );
}

function CheckoutPageLegacy() {
  const { cartItems, total, clearCart, flash } = useCart();
  const [step, setStep] = useState(1);
  const [payOpen, setPayOpen] = useState(false);
  if (cartItems.length === 0) return <Navigate to="/" replace />;
  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[24px] bg-white p-5 shadow-card md:p-7">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((value) => <button key={value} onClick={() => setStep(value)} className={`flex-1 rounded-2xl px-3 py-3 text-sm font-bold ${step === value ? 'bg-primary text-white' : 'bg-bg text-muted'}`}>{value}. {['Address', 'Slot', 'Payment'][value - 1]}</button>)}
        </div>
        {step === 1 && <AddressStep onNext={() => setStep(2)} />}
        {step === 2 && <SlotStep onNext={() => setStep(3)} />}
        {step === 3 && <PaymentStep total={total} onPay={() => setPayOpen(true)} />}
      </section>
      <aside className="h-max rounded-[24px] bg-white p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Order Summary</h2>
        <div className="mt-4 space-y-3">
          {cartItems.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.name} × {item.qty}</span><span className="font-mono">{formatPrice(item.price * item.qty)}</span></div>)}
        </div>
        <div className="mt-5 border-t border-line pt-4 text-lg font-extrabold">Payable: {formatPrice(total)}</div>
      </aside>
      <PaymentModal open={payOpen} total={total} onClose={() => setPayOpen(false)} onSuccess={() => { clearCart(); flash('Order placed successfully'); }} />
    </motion.main>
  );
}

function AddressStep({ onNext }) {
  const fields = ['Name', 'Phone', 'Flat / House', 'Area', 'Landmark', 'Pincode', 'City'];
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Delivery Address</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{fields.map((field) => <input key={field} placeholder={field} defaultValue={field === 'City' ? 'Patna' : ''} className="rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-primary" />)}</div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {['Home · Boring Road', 'Office · Fraser Road'].map((item) => <label key={item} className="flex items-center gap-3 rounded-2xl border border-line p-4 font-bold"><input type="radio" name="address" defaultChecked={item.startsWith('Home')} /> {item}</label>)}
      </div>
      <button className="mt-5 rounded-2xl border border-primary px-5 py-3 font-bold text-primary"><MapPin className="mr-2 inline" size={18} />Use Current Location</button>
      <button onClick={onNext} className="mt-5 w-full rounded-2xl bg-primary py-4 font-bold text-white">Continue to Delivery Slot</button>
    </div>
  );
}

function SlotStep({ onNext }) {
  const [slot, setSlot] = useState('Today · 4PM-6PM');
  const slots = ['Today · 2PM-4PM', 'Today · 4PM-6PM', 'Today · 6PM-8PM', 'Tomorrow · 8AM-10AM', 'Tomorrow · 10AM-12PM', 'Tomorrow · 12PM-2PM'];
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Choose Delivery Slot</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-3">{slots.map((item) => <button key={item} onClick={() => setSlot(item)} className={`rounded-2xl border p-4 text-left font-bold ${slot === item ? 'border-primary bg-emerald-50 text-primary' : 'border-line bg-white'}`}>{slot === item && <Check className="mb-2" size={18} />}{item}</button>)}</div>
      <button onClick={onNext} className="mt-6 w-full rounded-2xl bg-primary py-4 font-bold text-white">Continue to Payment</button>
    </div>
  );
}

function PaymentStep({ total, onPay }) {
  const [method, setMethod] = useState('UPI');
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Payment Method</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {['UPI', 'Net Banking', 'Credit / Debit Card', 'Cash on Delivery'].map((item) => <button key={item} onClick={() => setMethod(item)} className={`rounded-2xl border p-4 text-left font-bold ${method === item ? 'border-primary bg-emerald-50 text-primary' : 'border-line bg-white'}`}><CreditCard className="mb-2" size={20} />{item}</button>)}
      </div>
      <button onClick={onPay} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary to-teal-500 py-4 font-bold text-white">Pay {formatPrice(total)}</button>
    </div>
  );
}

function PaymentModal({ open, total, onClose, onSuccess }) {
  const [status, setStatus] = useState('form');
  const navigate = useNavigate();
  useEffect(() => { if (!open) setStatus('form'); }, [open]);
  const pay = () => {
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 1600);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
          <motion.div initial={{ y: 28, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, scale: 0.98 }} className="grid w-full max-w-3xl overflow-hidden rounded-[24px] bg-white shadow-float md:grid-cols-[260px_1fr]">
            <aside className="bg-ink p-6 text-white">
              <div className="flex items-center gap-2 font-display text-xl font-extrabold"><ShoppingBasket /> FreshCart Pay</div>
              <p className="mt-6 text-white/70">Secure demo payment gateway</p>
              <div className="mt-8 rounded-2xl bg-white/10 p-4"><div className="text-sm text-white/70">Amount</div><div className="font-mono text-3xl font-bold">{formatPrice(total)}</div></div>
            </aside>
            <div className="p-6">
              <button onClick={onClose} className="float-right rounded-xl bg-bg p-2"><X size={18} /></button>
              {status === 'form' && (
                <div>
                  <h2 className="font-display text-2xl font-extrabold">Complete Payment</h2>
                  <div className="mt-5 grid gap-3">
                    <input placeholder="Enter UPI ID" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-primary" />
                    <input placeholder="Card number" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-primary" />
                    <div className="grid grid-cols-2 gap-3"><input placeholder="MM/YY" className="rounded-xl border border-line px-4 py-3" /><input placeholder="CVV" className="rounded-xl border border-line px-4 py-3" /></div>
                  </div>
                  <button onClick={pay} className="mt-6 w-full rounded-2xl bg-primary py-4 font-bold text-white">Verify & Pay</button>
                </div>
              )}
              {status === 'loading' && <div className="grid min-h-72 place-items-center text-center"><div className="size-16 animate-spin rounded-full border-4 border-line border-t-primary" /><p className="font-bold">Processing payment...</p></div>}
              {status === 'success' && (
                <div className="grid min-h-72 place-items-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-20 place-items-center rounded-full bg-success text-white"><Check size={40} /></motion.div>
                  <div><h3 className="mt-5 font-display text-3xl font-extrabold">Order Placed!</h3><p className="text-muted">Order ID ORD-8823 is now being packed.</p></div>
                  <button onClick={() => { onSuccess(); navigate('/order/ORD-8823'); }} className="rounded-2xl bg-primary px-6 py-3 font-bold text-white">Track Order</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckoutPage() {
  const { cartItems, total, clearCart, flash } = useCart();
  const { addOrder } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [address, setAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenAddress') || 'null'); } catch { return null; }
  });
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null'); } catch { return null; }
  });
  const [changeAddress, setChangeAddress] = useState(new URLSearchParams(location.search).get('changeAddress') === '1');
  if (cartItems.length === 0) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/" replace />;
  const saveAddress = (nextAddress) => {
    localStorage.setItem('sevenHeavenAddress', JSON.stringify(nextAddress));
    setAddress(nextAddress);
    setChangeAddress(false);
  };
  const placeOrder = (method) => {
    const order = {
      id: `ORD-${Math.floor(9000 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'delivered',
      payment: method,
      total,
      address,
      items: cartItems.map((item) => ({ id: item.id, name: item.name, image: item.image, unit: item.unit, price: item.price, qty: item.qty })),
    };
    const orders = JSON.parse(localStorage.getItem('sevenHeavenOrders') || '[]');
    localStorage.setItem('sevenHeavenOrders', JSON.stringify([order, ...orders]));
    addOrder(order);
    clearCart();
    flash('Order placed and added to history');
    navigate('/account?tab=orders');
  };
  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="mx-auto max-w-md bg-[#eef1f7]">
      {!address || changeAddress ? <DeliveryAddressForm address={address} onSave={saveAddress} /> : <PaymentOptionsScreen total={total} address={address} onChangeAddress={() => setChangeAddress(true)} onPlaceOrder={placeOrder} />}
    </motion.main>
  );
}

function DeliveryAddressForm({ address, onBack, onSave }) {
  const [form, setForm] = useState(address || { label: 'Home', name: '', phone: '', line: '', area: '', landmark: '', pincode: '', city: 'Patna' });
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    onSave({ ...form, line: form.line || `${form.area}, ${form.landmark}` });
  };
  return (
    <form onSubmit={save} className="min-h-[calc(100vh-73px)] bg-white">
      <div className="flex items-center gap-3 border-b border-line px-4 py-4">
        {onBack ? (
          <button type="button" onClick={onBack} className="grid size-9 place-items-center"><ArrowLeft size={22} /></button>
        ) : (
          <Link to="/" className="grid size-9 place-items-center"><ArrowLeft size={22} /></Link>
        )}
        <div><h1 className="font-display text-lg font-extrabold">Delivery Address</h1><p className="text-xs text-muted">Set your default delivery location</p></div>
      </div>
      <div className="space-y-3 p-4">
        {[
          ['name', 'Name'], ['phone', 'Phone'], ['line', 'Flat / House / Floor'], ['area', 'Area / Street'], ['landmark', 'Landmark'], ['pincode', 'Pincode'], ['city', 'City'],
        ].map(([key, label]) => (
          <input key={key} value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} required={['name', 'phone', 'line', 'pincode', 'city'].includes(key)} placeholder={label} className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-primary" />
        ))}
        <div className="grid grid-cols-3 gap-2">
          {['Home', 'Work', 'Other'].map((label) => <button type="button" key={label} onClick={() => setField('label', label)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${form.label === label ? 'border-primary bg-primary/10 text-primary' : 'border-line'}`}>{label}</button>)}
        </div>
      </div>
      <div className="sticky bottom-0 bg-white p-4">
        <button className="w-full rounded-xl bg-green-700 py-4 font-extrabold text-white">Save address</button>
      </div>
    </form>
  );
}

function PaymentOptionsScreen({ total, address, onBack, onChangeAddress, onPlaceOrder }) {
  const [moreWallets, setMoreWallets] = useState(false);
  return (
    <section className="min-h-[calc(100vh-73px)] bg-[#eef1f7]">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          {onBack ? (
            <button onClick={onBack} className="grid size-8 place-items-center"><ArrowLeft size={22} /></button>
          ) : (
            <Link to="/" className="grid size-8 place-items-center"><ArrowLeft size={22} /></Link>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-lg font-extrabold">Payment Options</h1>
            <p className="truncate text-xs text-muted">{address.label} - {address.line}, {address.area}, {address.city}</p>
          </div>
          <button onClick={onChangeAddress} className="ml-auto text-xs font-extrabold text-green-700">Change</button>
        </div>
        <div className="px-5 py-4 font-display text-lg font-extrabold">To Pay: <span className="text-green-700">₹{total}</span></div>
      </div>
      <div className="space-y-6 p-5">
        <PaymentGroup title="Pay by UPI">
          <PaymentOption icon="⌗" title="Pay via QR Code" badge="NEW" onClick={() => onPlaceOrder('UPI QR')} />
        </PaymentGroup>
        <PaymentGroup title="Credit & Debit Cards">
          <PaymentOption icon="+" title="Add New Card" subtitle="Visa, Mastercard, Rupay & more" onClick={() => onPlaceOrder('Card')} pink />
        </PaymentGroup>
        <PaymentGroup title="Pluxee">
          <PaymentOption icon="pluxee" title="Pluxee" subtitle="There are non food items in the cart" disabled rightText="Currently Ineligible" />
        </PaymentGroup>
        <PaymentGroup title="Wallets">
          <PaymentOption icon="पे" title="PhonePe Wallet" onClick={() => onPlaceOrder('PhonePe Wallet')} />
          <PaymentOption icon="pay" title="Amazon Pay Balance" onClick={() => onPlaceOrder('Amazon Pay')} />
          {moreWallets && <PaymentOption icon="₹" title="Paytm Wallet" onClick={() => onPlaceOrder('Paytm Wallet')} />}
          <button onClick={() => setMoreWallets((value) => !value)} className="flex w-full items-center gap-3 border-t border-line px-4 py-4 text-left text-sm font-extrabold text-pink-500"><ChevronDown size={18} /> View More Wallets</button>
        </PaymentGroup>
        <PaymentGroup title="Pay Later">
          <PaymentOption icon="L" title="LazyPay" subtitle="Currently unavailable" disabled rightText="Currently Ineligible" />
        </PaymentGroup>
      </div>
      <div className="sticky bottom-0 bg-white p-4">
        <button onClick={() => onPlaceOrder('Cash on Delivery')} className="w-full rounded-xl bg-green-700 py-4 font-extrabold text-white">Place Order</button>
      </div>
    </section>
  );
}

function PaymentGroup({ title, children }) {
  return <div><h2 className="mb-3 font-display text-base font-extrabold text-ink">{title}</h2><div className="overflow-hidden rounded-2xl bg-white">{children}</div></div>;
}

function PaymentOption({ icon, title, subtitle, badge, rightText, disabled, pink, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`flex w-full items-center gap-4 px-4 py-4 text-left ${disabled ? 'opacity-45' : 'hover:bg-bg'}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-sm font-extrabold text-primary">{icon}</span>
      <span className="min-w-0 flex-1"><span className={`block text-sm font-extrabold ${pink ? 'text-pink-500' : 'text-ink'}`}>{title} {badge && <span className="ml-2 rounded bg-green-600 px-1.5 py-0.5 text-[10px] text-white">{badge}</span>}</span>{subtitle && <span className="mt-1 block text-xs text-muted">{subtitle}</span>}</span>
      {rightText ? <span className="text-xs text-muted">{rightText}</span> : <ChevronRight className="text-pink-500" size={20} />}
    </button>
  );
}

function OrderTrackingPage() {
  const steps = ['Order Placed', 'Payment Confirmed', 'Being Packed', 'Out for Delivery', 'Delivered'];
  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[24px] bg-white p-6 shadow-card">
        <h1 className="font-display text-3xl font-extrabold">Arriving in 14 mins</h1>
        <p className="mt-2 text-muted">Order ORD-8823 · FreshCart partner is preparing your bag.</p>
        <div className="mt-8 space-y-6">
          {steps.map((step, index) => <div key={step} className="flex gap-4"><div className={`grid size-10 place-items-center rounded-full ${index < 3 ? 'bg-success text-white' : 'bg-bg text-muted'}`}>{index < 2 ? <Check size={18} /> : index === 2 ? <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}><PackageCheck size={18} /></motion.span> : index + 1}</div><div><h3 className="font-bold">{step}</h3><p className="text-sm text-muted">{index < 3 ? `2:${30 + index} PM` : 'Pending'}</p></div></div>)}
        </div>
      </section>
      <aside className="space-y-5">
        <div className="overflow-hidden rounded-[24px] bg-white shadow-card">
          <div className="relative h-52 bg-emerald-100">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(90deg, rgba(28,168,92,.16) 1px, transparent 1px), linear-gradient(rgba(28,168,92,.16) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} className="absolute left-1/2 top-1/2 rounded-full bg-accent p-3 text-white"><MapPin /></motion.div>
          </div>
          <div className="p-5"><h2 className="font-display text-xl font-bold">Ravi K.</h2><p className="text-muted">Delivery partner · 4.8 rating</p><button className="mt-4 rounded-xl bg-primary px-4 py-3 font-bold text-white"><Phone className="mr-2 inline" size={18} />Call</button></div>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-card"><h3 className="font-display text-xl font-bold">Items</h3><p className="mt-2 text-muted">Aashirvaad Atta, Organic Tomatoes, Amul Butter</p></div>
      </aside>
    </motion.main>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const login = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get('email') === 'admin@freshcart.com' && data.get('password') === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else setError('Use admin@freshcart.com / admin123');
  };
  return (
    <main className="grid min-h-[calc(100vh-74px)] place-items-center px-4">
      <form onSubmit={login} className="w-full max-w-md rounded-[24px] bg-white p-7 shadow-card">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary text-white"><ShieldCheck /></div>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Admin Login</h1>
        <p className="mt-2 text-muted">Demo credentials are prefilled for the client walkthrough.</p>
        <input name="email" defaultValue="admin@freshcart.com" className="mt-6 w-full rounded-xl border border-line px-4 py-3" />
        <input name="password" defaultValue="admin123" type="password" className="mt-3 w-full rounded-xl border border-line px-4 py-3" />
        {error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-primary py-4 font-bold text-white">Enter Dashboard</button>
      </form>
    </main>
  );
}

function RequireAdmin({ children }) {
  return localStorage.getItem('adminAuth') === 'true' ? children : <Navigate to="/admin/login" replace />;
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const nav = [
    ['Dashboard', '/admin', LayoutDashboard], ['Products', '/admin/inventory', Boxes],
    ['Orders', '/admin/orders', ShoppingCart], ['Analytics', '/admin/analytics', BarChart3],
  ];
  const location = useLocation();
  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#f6f7fb] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:overflow-hidden">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/admin" className="brand-logo"><span className="brand-logo-mark">7</span><span className="brand-logo-text">Admin</span></Link>
          <Menu className="lg:hidden" />
        </div>
        <nav className="grid gap-2">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} to={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${location.pathname === href ? 'bg-orange-50 text-primary shadow-sm' : 'text-[#5b6475] hover:bg-bg hover:text-ink'}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl bg-[#fff7ed] p-4">
          <div className="text-xs font-semibold uppercase text-primary">Live store sync</div>
          <p className="mt-1 text-xs leading-5 text-muted">Product changes update customer pages in this demo.</p>
        </div>
        <button onClick={() => { localStorage.removeItem('adminAuth'); navigate('/'); }} className="mt-5 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#5b6475] hover:bg-red-50 hover:text-danger"><LogOut size={18} />Exit Admin</button>
      </aside>
      <main className="min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}

function AdminDashboard() {
  const { orders, products } = useAdmin();
  const lowStock = products.filter((product) => product.stock < 20);
  const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  return (
    <AdminLayout>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div><h1 className="font-display text-xl font-bold text-ink md:text-2xl">Admin Dashboard</h1><p className="mt-1 text-sm text-muted">Manage products, orders and storefront inventory.</p></div>
        <Link to="/admin/inventory" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card"><Plus className="mr-2 inline" size={17} />Add Product</Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stats icon={PackageCheck} label="Total Orders" value={orders.length} note="Live order count" />
        <Stats icon={CircleDollarSign} label="Revenue" value={`Rs ${revenue.toLocaleString('en-IN')}`} note="From customer orders" />
        <Stats icon={Boxes} label="Products" value={products.length} note="Visible on website" />
        <Stats icon={Clock} label="Low Stock" value={lowStock.length} note="Action needed" warn />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <ChartPanel title="Revenue Over Time"><ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><defs><linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1CA85C" stopOpacity={0.45}/><stop offset="95%" stopColor="#1CA85C" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e5eae5" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area dataKey="revenue" stroke="#1CA85C" fill="url(#green)" strokeWidth={3} /></AreaChart></ResponsiveContainer></ChartPanel>
        <section className="rounded-[20px] bg-white p-5 shadow-card"><h2 className="font-display text-lg font-semibold">Low Stock Alerts</h2><div className="mt-4 space-y-3">{lowStock.slice(0, 6).map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-bg p-3"><div><div className="text-sm font-medium">{item.name}</div><div className="text-sm text-muted">{item.stock} left · reorder 20</div></div><button className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white">Restock</button></div>)}</div></section>
      </div>
      <OrdersTable compact />
    </AdminLayout>
  );
}

function Stats({ icon: Icon, label, value, note, warn }) {
  return <div className="rounded-[20px] bg-white p-5 shadow-card"><div className={`mb-4 grid size-10 place-items-center rounded-2xl ${warn ? 'bg-amber-100 text-warning' : 'bg-emerald-100 text-primary'}`}><Icon size={19} /></div><div className="font-display text-2xl font-semibold">{value}</div><div className="text-sm text-muted">{label}</div><div className="mt-2 text-xs font-medium text-primary">{note}</div></div>;
}

function ChartPanel({ title, children }) {
  return <section className="rounded-[20px] bg-white p-5 shadow-card"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">{title}</h2><button className="rounded-xl bg-bg px-3 py-2 text-sm font-medium">Weekly <ChevronDown className="inline" size={16} /></button></div>{children}</section>;
}

function InventoryPage() {
  const { products, updateProduct, deleteProduct, addProduct } = useAdmin();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState('all');
  const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()) && (category === 'all' || product.category === category));
  return (
    <AdminLayout>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div><h1 className="font-display text-xl font-bold md:text-2xl">Product List</h1><p className="mt-1 text-sm text-muted">Add, edit stock and remove products from the live website.</p></div>
        <button onClick={() => setModal(true)} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card"><Plus className="mr-2 inline" size={18} />Add Product</button>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 shadow-card md:grid-cols-[1fr_220px]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by product name" className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-line px-4 py-3 text-sm font-medium outline-none">
          <option value="all">All Categories</option>
          {categories.filter((item) => item.id !== 'all').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="mt-5 overflow-auto rounded-[20px] bg-white shadow-card"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#fafafa] text-xs font-medium uppercase text-muted"><tr><th className="p-4">Product</th><th>Category</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Website</th><th>Actions</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id} className="border-t border-line hover:bg-orange-50/40"><td className="p-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="size-12 rounded-xl object-cover" /><div><div className="font-medium">{product.name}</div><div className="text-xs text-muted">{product.unit}</div></div></div></td><td className="capitalize">{product.category}</td><td className="font-mono text-xs">{product.sku}</td><td className="font-mono font-medium">Rs {product.price}</td><td><input type="number" value={product.stock} onChange={(e) => updateProduct(product.id, { stock: Number(e.target.value) })} className="w-20 rounded-lg border border-line px-2 py-1 font-mono text-sm" /><div className="mt-1 h-1.5 w-24 rounded bg-line"><div className={`h-full rounded ${product.stock < 20 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min(100, product.stock / 2)}%` }} /></div></td><td><StatusBadge status={product.stock === 0 ? 'cancelled' : product.stock < 20 ? 'pending' : 'delivered'} label={product.stock === 0 ? 'Out' : product.stock < 20 ? 'Low' : 'In Stock'} /></td><td><Link to={`/product/${product.id}`} className="text-xs font-semibold text-primary">View</Link></td><td><button onClick={() => updateProduct(product.id, { isFeatured: !product.isFeatured })} className="mr-2 rounded-lg bg-bg px-3 py-2 text-xs font-medium">{product.isFeatured ? 'Featured' : 'Feature'}</button><button onClick={() => deleteProduct(product.id)} className="rounded-lg bg-red-50 px-3 py-2 text-danger"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
      <AddProductModal open={modal} onClose={() => setModal(false)} onSave={addProduct} />
    </AdminLayout>
  );
}

function AddProductModal({ open, onClose, onSave }) {
  const save = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const mrp = Number(data.get('mrp'));
    const price = Number(data.get('price'));
    onSave({ name: data.get('name'), category: data.get('category'), price, mrp, stock: Number(data.get('stock')), unit: data.get('unit'), sku: data.get('sku') || `FC-${Date.now().toString().slice(-4)}`, image: data.get('image') || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80', discount: Math.max(0, Math.round(((mrp - price) / mrp) * 100)), description: data.get('description') || 'Freshly added supermarket product.' });
    onClose();
  };
  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"><form onSubmit={save} className="w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-float"><div className="flex justify-between"><div><h2 className="font-display text-xl font-semibold">Add Product</h2><p className="mt-1 text-sm text-muted">New products appear on the website immediately.</p></div><button type="button" onClick={onClose}><X /></button></div><div className="mt-5 grid gap-3 md:grid-cols-2"><input name="name" required placeholder="Product name" className="rounded-xl border border-line px-4 py-3" /><select name="category" required className="rounded-xl border border-line px-4 py-3"><option value="">Select category</option>{categories.filter((item) => item.id !== 'all').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input name="mrp" required type="number" placeholder="MRP" className="rounded-xl border border-line px-4 py-3" /><input name="price" required type="number" placeholder="Selling price" className="rounded-xl border border-line px-4 py-3" /><input name="stock" required type="number" placeholder="Stock quantity" className="rounded-xl border border-line px-4 py-3" /><input name="unit" required placeholder="Unit, e.g. 500 g" className="rounded-xl border border-line px-4 py-3" /><input name="sku" placeholder="SKU (optional)" className="rounded-xl border border-line px-4 py-3" /><input name="image" placeholder="Image URL" className="rounded-xl border border-line px-4 py-3" /></div><textarea name="description" placeholder="Description" className="mt-3 min-h-24 w-full rounded-xl border border-line px-4 py-3" /><button className="mt-5 w-full rounded-2xl bg-primary py-4 font-semibold text-white">Save Product</button></form></motion.div>}</AnimatePresence>;
}

function OrdersPage() {
  return <AdminLayout><h1 className="font-display text-xl font-bold md:text-2xl">Orders</h1><OrdersTable /></AdminLayout>;
}

function OrdersTable({ compact }) {
  const { orders, updateOrderStatus } = useAdmin();
  const list = compact ? orders.slice(0, 5) : orders;
  return (
    <section className="mt-5 overflow-auto rounded-[20px] bg-white shadow-card">
      <div className="flex items-center justify-between p-5"><h2 className="font-display text-lg font-semibold">{compact ? 'Recent Orders' : 'Order Management'}</h2><button className="rounded-xl bg-bg px-4 py-2 text-sm font-medium">Export CSV</button></div>
      <table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-bg text-muted"><tr><th className="p-4">Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Time</th><th>Action</th></tr></thead><tbody>{list.map((order) => { const customer = order.customer || { name: order.address?.name || 'Website Customer', phone: order.address?.phone || 'Saved user' }; return <tr key={order.id} className="border-t border-line hover:bg-orange-50/50"><td className="p-4 font-mono font-medium">{order.id}</td><td><div className="font-medium">{customer.name}</div><div className="text-muted">{customer.phone}</div></td><td>{order.items.length} items</td><td className="font-mono">Rs {Number(order.total || 0).toLocaleString('en-IN')}</td><td><StatusBadge status={order.status} /></td><td>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="rounded-lg border border-line px-3 py-2"><option value="pending">Pending</option><option value="processing">Processing</option><option value="out_for_delivery">Out for Delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>; })}</tbody></table>
    </section>
  );
}

function StatusBadge({ status, label }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[status]}`}>{label || statusLabels[status]}</span>;
}

function AnalyticsPage() {
  const pie = [{ name: 'Vegetables', value: 34 }, { name: 'Dairy', value: 22 }, { name: 'Grains', value: 19 }, { name: 'Snacks', value: 15 }, { name: 'Others', value: 10 }];
  const colors = ['#1CA85C', '#FF6B35', '#10B981', '#F59E0B', '#64748b'];
  return (
    <AdminLayout>
      <h1 className="font-display text-xl font-bold md:text-2xl">Analytics</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-4"><Stats icon={CircleDollarSign} label="Average Order Value" value="Rs 342" note="+5%" /><Stats icon={User} label="Repeat Customers" value="64%" note="+9%" /><Stats icon={Carrot} label="Top Category" value="Veg" note="Most ordered" /><Stats icon={Clock} label="Peak Hour" value="7-8 PM" note="High demand" /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Revenue Trend"><ResponsiveContainer width="100%" height={280}><LineChart data={chartData}><CartesianGrid stroke="#e5eae5" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="revenue" stroke="#1CA85C" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartPanel>
        <ChartPanel title="Orders by Category"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={pie} dataKey="value" innerRadius={70} outerRadius={105}>{pie.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></ChartPanel>
        <ChartPanel title="Top Selling Products"><ResponsiveContainer width="100%" height={280}><BarChart data={[{ name: 'Atta', sales: 320 }, { name: 'Milk', sales: 280 }, { name: 'Rice', sales: 260 }, { name: 'Banana', sales: 210 }, { name: 'Butter', sales: 170 }]} layout="vertical"><XAxis type="number" /><YAxis dataKey="name" type="category" /><Tooltip /><Bar dataKey="sales" fill="#FF6B35" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></ChartPanel>
        <section className="rounded-[20px] bg-white p-5 shadow-card"><h2 className="font-display text-lg font-semibold">Hourly Order Heatmap</h2><div className="mt-5 grid grid-cols-7 gap-2">{Array.from({ length: 49 }).map((_, index) => <div key={index} className="aspect-square rounded-lg" style={{ background: `rgba(28,168,92,${0.12 + (index % 7) * 0.09})` }} />)}</div></section>
      </div>
    </AdminLayout>
  );
}

function ProductsPage() {
  const location = useLocation();
  const { products } = useAdmin();
  const query = new URLSearchParams(location.search).get('q') || '';
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) => [product.name, product.category, product.description, product.unit].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
    : products;
  return <motion.main variants={page} initial="initial" animate="animate" exit="exit"><ProductGrid products={filteredProducts} title={query ? `Search results for "${query}"` : 'Product Listing'} /></motion.main>;
}

function OrderHistoryPage() {
  return <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="mx-auto max-w-7xl px-4 py-6"><h1 className="font-display text-3xl font-extrabold">Order History</h1><div className="mt-5 grid gap-4">{['ORD-8823', 'ORD-8825', 'ORD-8831'].map((id) => <Link key={id} to={`/order/${id}`} className="rounded-[20px] bg-white p-5 shadow-card"><div className="font-mono font-bold">{id}</div><div className="mt-2 text-muted">Groceries delivered to Patna · View live-style timeline</div></Link>)}</div></motion.main>;
}

function AccountPageLegacy() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null');
    } catch {
      return null;
    }
  });
  const orderItems = [catalog[40], catalog[47], catalog[28], catalog[16]].filter(Boolean);
  const mrp = orderItems.reduce((sum, item) => sum + item.price, 0);
  const handling = 2;
  const gst = 0.1;
  const total = Math.round(mrp + handling + gst);
  const menu = [
    ['My Addresses', MapPin],
    ['My Orders', ReceiptText],
    ['My Prescriptions', FileText],
    ['E-Gift Cards', Gift],
    ['Account privacy', Lock],
    ['Logout', User],
  ];

  if (!user) return <Navigate to="/" replace />;

  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="bg-white">
      <section className="mx-auto grid max-w-7xl border-x border-line shadow-card lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-line bg-white">
          <div className="border-b border-line px-24 py-12 text-sm text-[#4b5565]">+91{user.mobile}</div>
          {menu.map(([label, Icon]) => (
            <button key={label} className="flex w-full items-center gap-4 border-b border-line px-7 py-5 text-left text-base font-medium text-[#566074] hover:bg-bg">
              <Icon size={20} /> {label}
            </button>
          ))}
        </aside>
        <section className="min-h-[820px] px-10 py-10 lg:px-16">
          <button onClick={() => navigate(-1)} className="grid size-14 place-items-center rounded-xl border border-line text-ink hover:bg-bg"><ArrowLeft size={24} /></button>
          <div className="mt-8">
            <h1 className="font-display text-2xl font-extrabold text-ink">Order summary</h1>
            <p className="mt-1 text-sm text-muted">Arrived at 10:50 pm</p>
            <button className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-green-700">Download Invoice <Download size={15} /></button>
          </div>
          <div className="mt-6 max-w-4xl">
            <h2 className="mb-4 text-lg font-extrabold text-ink">{orderItems.length} items in this order</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[80px_1fr_auto] items-center gap-4">
                  <img src={item.image} alt="" className="size-20 rounded-xl border border-line object-cover" />
                  <div>
                    <h3 className="text-sm font-medium text-ink">{item.name}</h3>
                    <p className="mt-3 text-sm text-muted">{item.unit} x 1</p>
                  </div>
                  <div className="font-mono text-sm font-extrabold text-ink">₹{item.price}</div>
                </div>
              ))}
            </div>
            <div className="my-5 h-3 bg-bg" />
            <h2 className="font-display text-lg font-extrabold text-ink">Bill details</h2>
            <div className="mt-5 border-t border-line pt-4 text-sm">
              <AccountBillLine label="MRP" value={`₹${mrp}`} />
              <AccountBillLine label="Handling charge" value={`+₹${handling}`} />
              <AccountBillLine label="Delivery charges" value="FREE" />
              <AccountBillLine label="GST on charges (govt. taxes)" value={`+₹${gst.toFixed(2)}`} />
              <div className="mt-3 flex justify-between text-base font-extrabold text-ink"><span>Bill total</span><span>₹{total}</span></div>
            </div>
          </div>
        </section>
      </section>
    </motion.main>
  );
}

function AccountBillLine({ label, value }) {
  return <div className="mb-3 flex justify-between text-[#374151]"><span>{label}</span><span className="font-mono text-ink">{value}</span></div>;
}

function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sevenHeavenUser') || 'null');
    } catch {
      return null;
    }
  });
  const activeTab = new URLSearchParams(location.search).get('tab') || 'orders';
  const { products: adminProducts } = useAdmin();
  const savedOrders = (() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenOrders') || '[]'); } catch { return []; }
  })();
  const orderItems = [adminProducts[40], adminProducts[47], adminProducts[28], adminProducts[16]].filter(Boolean);
  const mrp = orderItems.reduce((sum, item) => sum + item.price, 0);
  const handling = 2;
  const gst = 0.1;
  const total = Math.round(mrp + handling + gst);
  const menu = [
    ['addresses', 'My Addresses', MapPin],
    ['orders', 'My Orders', ReceiptText],
    ['prescriptions', 'My Prescriptions', FileText],
    ['gift-cards', 'E-Gift Cards', Gift],
    ['faqs', "FAQ's", Info],
  ];

  if (!user) return <Navigate to="/" replace />;

  return (
    <motion.main variants={page} initial="initial" animate="animate" exit="exit" className="bg-white">
      <section className="mx-auto min-h-[calc(100vh-73px)] max-w-7xl border-x border-line shadow-card lg:grid lg:h-[calc(100vh-73px)] lg:grid-cols-[300px_1fr] lg:overflow-hidden">
        <aside className="border-b border-line bg-white lg:h-full lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="hidden border-b border-line px-16 py-10 text-xs text-[#4b5565] lg:block">+91{user.mobile}</div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:gap-0 lg:overflow-visible lg:p-0">
            {menu.map(([key, label, Icon]) => (
              <Link key={key} to={`/account?tab=${key}`} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition lg:w-full lg:rounded-none lg:border-x-0 lg:border-t-0 lg:border-b lg:border-line lg:px-6 lg:py-4 lg:text-sm ${activeTab === key ? 'border-primary bg-orange-50 text-primary lg:border-line' : 'border-line text-[#566074] hover:bg-bg'}`}>
                <Icon size={16} className="shrink-0 lg:size-[18px]" /> <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>
          <button onClick={() => { localStorage.removeItem('sevenHeavenUser'); navigate('/'); }} className="hidden w-full items-center gap-4 border-b border-line px-6 py-4 text-left text-sm font-medium text-[#566074] hover:bg-bg lg:flex">
            <User size={18} /> Logout
          </button>
        </aside>
        <section className="min-h-0 px-4 py-5 sm:px-6 lg:h-full lg:overflow-y-auto lg:px-12 lg:py-8">
          <button onClick={() => navigate(-1)} className="hidden size-12 place-items-center rounded-xl border border-line text-ink hover:bg-bg lg:grid"><ArrowLeft size={22} /></button>
          {activeTab === 'orders' && <AccountOrders orders={savedOrders} orderItems={orderItems} mrp={mrp} handling={handling} gst={gst} total={total} />}
          {activeTab === 'addresses' && <AccountAddresses />}
          {activeTab === 'prescriptions' && <UnavailableSection title="My Prescriptions" copy="Prescription uploads are not available in this demo yet." />}
          {activeTab === 'gift-cards' && <UnavailableSection title="E-Gift Cards" copy="E-Gift cards are not available in this demo yet." />}
          {activeTab === 'faqs' && <FaqSection />}
        </section>
      </section>
    </motion.main>
  );
}

function AccountOrders({ orders = [], orderItems, mrp, handling, gst, total }) {
  if (orders.length > 0) {
    return (
      <div className="mt-7 max-w-4xl">
        <h1 className="font-display text-xl font-extrabold text-ink">My Orders</h1>
        <div className="mt-5 space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-extrabold text-ink">{order.id}</h2>
                  <p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleString()} · {order.payment}</p>
                  <p className="mt-1 text-xs text-muted">Delivering to {order.address?.label || 'Home'} - {order.address?.line}</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">{order.status}</span>
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
                    <img src={item.image} alt="" className="size-12 rounded-lg border border-line object-cover" />
                    <div><h3 className="text-sm font-medium text-ink">{item.name}</h3><p className="text-xs text-muted">{item.unit} x {item.qty}</p></div>
                    <span className="font-mono text-sm font-extrabold">Rs {item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-line pt-3 text-right font-mono text-base font-extrabold">Rs {order.total}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-7 max-w-4xl">
      <h1 className="font-display text-xl font-extrabold text-ink">Order summary</h1>
      <p className="mt-1 text-xs text-muted">Arrived at 10:50 pm</p>
      <button className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-green-700">Download Invoice <Download size={14} /></button>
      <h2 className="mb-4 mt-6 text-base font-extrabold text-ink">{orderItems.length} items in this order</h2>
      <div className="space-y-4">
        {orderItems.map((item) => (
          <div key={item.id} className="grid grid-cols-[70px_1fr_auto] items-center gap-4">
            <img src={item.image} alt="" className="size-16 rounded-xl border border-line object-cover" />
            <div>
              <h3 className="text-sm font-medium text-ink">{item.name}</h3>
              <p className="mt-2 text-xs text-muted">{item.unit} x 1</p>
            </div>
            <div className="font-mono text-sm font-extrabold text-ink">Rs {item.price}</div>
          </div>
        ))}
      </div>
      <div className="my-5 h-3 bg-bg" />
      <h2 className="font-display text-base font-extrabold text-ink">Bill details</h2>
      <div className="mt-5 border-t border-line pt-4 text-sm">
        <AccountBillLine label="MRP" value={`Rs ${mrp}`} />
        <AccountBillLine label="Handling charge" value={`+Rs ${handling}`} />
        <AccountBillLine label="Delivery charges" value="FREE" />
        <AccountBillLine label="GST on charges (govt. taxes)" value={`+Rs ${gst.toFixed(2)}`} />
        <div className="mt-3 flex justify-between text-sm font-extrabold text-ink"><span>Bill total</span><span>Rs {total}</span></div>
      </div>
    </div>
  );
}

function AccountAddresses() {
  const savedAddress = (() => {
    try { return JSON.parse(localStorage.getItem('sevenHeavenAddress') || 'null'); } catch { return null; }
  })();
  const addresses = savedAddress ? [savedAddress] : [
    { label: 'Home', line: 'Boring Road, Patna, Bihar 800001', note: 'Default delivery address' },
    { label: 'Office', line: 'Fraser Road, Patna, Bihar 800001', note: 'Available 10 AM - 7 PM' },
  ];
  return (
    <div className="mt-7 max-w-3xl">
      <h1 className="font-display text-xl font-extrabold text-ink">My Addresses</h1>
      <div className="mt-5 grid gap-4">
        {addresses.map((address) => (
          <div key={address.label} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 text-primary" size={18} />
              <div>
                <h2 className="text-sm font-extrabold text-ink">{address.label}</h2>
                <p className="mt-1 text-sm text-[#4b5565]">{address.line}</p>
                <p className="mt-1 text-xs text-muted">{address.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-5 rounded-xl border border-primary px-5 py-3 text-sm font-extrabold text-primary">Add New Address</button>
    </div>
  );
}

function UnavailableSection({ title, copy }) {
  return (
    <div className="mt-7 grid min-h-[420px] max-w-3xl place-items-center rounded-2xl border border-dashed border-line bg-bg p-8 text-center">
      <div>
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-white text-primary"><Info size={24} /></div>
        <h1 className="mt-4 font-display text-xl font-extrabold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">{copy}</p>
      </div>
    </div>
  );
}

function FaqSection() {
  return (
    <div className="mt-7 max-w-3xl">
      <h1 className="font-display text-xl font-extrabold text-ink">FAQ's</h1>
      {['How fast is delivery?', 'Can I cancel an order?', 'How do refunds work?'].map((question) => (
        <div key={question} className="mt-4 rounded-2xl border border-line p-5">
          <h2 className="text-sm font-extrabold text-ink">{question}</h2>
          <p className="mt-2 text-sm text-muted">This is a demo response for the account help section.</p>
        </div>
      ))}
    </div>
  );
}

function SiteFooter() {
  const footerLinks = [
    { title: 'Shop', links: ['Fresh vegetables', 'Dairy essentials', 'Snacks & drinks', 'Household care'] },
    { title: '7Heaven', links: ['About us', 'Delivery promise', 'Partner stores', 'Careers'] },
    { title: 'Support', links: ['Help center', 'Track order', 'Returns', 'Contact'] },
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-9 md:grid-cols-[1.25fr_2fr]">
          <div>
            <Link to="/" className="brand-logo" aria-label="7Heaven home">
              <span className="brand-logo-mark">7</span>
              <span className="brand-logo-text">Heaven</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Daily groceries, fresh staples, and home essentials delivered with a clean, fast shopping experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['15 min delivery', 'Fresh picks', 'Secure checkout'].map((item) => (
                <span key={item} className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-medium text-[#4b5565]">{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-7 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
                <div className="mt-3 grid gap-2.5">
                  {section.links.map((link) => (
                    <a key={link} href="#top" className="text-sm text-muted transition hover:text-primary">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-line pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 7Heaven Grocery. Demo storefront for quick commerce.</p>
          <div className="flex gap-4">
            <a href="#top" className="hover:text-primary">Privacy</a>
            <a href="#top" className="hover:text-primary">Terms</a>
            <a href="#top" className="hover:text-primary">Refund policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:category" element={<CategoryListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/inventory" element={<RequireAdmin><InventoryPage /></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin><OrdersPage /></RequireAdmin>} />
          <Route path="/admin/analytics" element={<RequireAdmin><AnalyticsPage /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {!isAdminRoute && <SiteFooter />}
      <CartDrawer />
      <Toast />
    </>
  );
}

export default App;
