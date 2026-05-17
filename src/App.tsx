import { useState, useEffect, createContext, useContext, FormEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, Search, LogOut, Menu, X, Plus, Minus, Trash2, Clock, UserPlus } from 'lucide-react';
import api from './services/api.ts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context ---
const AuthContext = createContext<any>(null);
const CartContext = createContext<any>(null);

const useAuth = () => useContext(AuthContext);
const useCart = () => useContext(CartContext);

// --- Components ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121214] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-500 rounded flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          MEDIX OS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest font-bold">
          <Link to="/" className="text-gray-500 hover:text-teal-400 transition-colors">Dashboard</Link>
          <Link to="/orders" className="text-gray-500 hover:text-teal-400 transition-colors">Catalog</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-teal-500 hover:text-white transition-colors">Admin Console</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/cart" className="bg-teal-500/10 text-teal-400 px-3 py-1.5 rounded border border-teal-500/20 text-[10px] font-mono font-bold hover:bg-teal-500/20 transition-all">
            CART: {cartCount} [₹{cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0).toFixed(2)}]
          </Link>
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{user.name}</span>
              <button 
                onClick={logout}
                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold px-4 py-1.5 rounded transition-colors uppercase tracking-widest">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden bg-[#121214] border-t border-gray-800 px-4 py-8 flex flex-col gap-4 font-bold text-[10px] uppercase tracking-[0.2em]"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400 p-2 italic">Dashboard</Link>
            <Link to="/orders" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400 p-2 italic">Catalog</Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="text-white hover:text-teal-400 p-2 italic flex items-center justify-between">
              Order_Queue
              {cartCount > 0 && <span className="bg-teal-500 text-white px-2 py-0.5 rounded text-[8px] font-mono">{cartCount}</span>}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-teal-500 p-2 italic">Admin_Console</Link>
            )}
            <div className="pt-4 border-t border-gray-800">
              {user ? (
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left text-red-500 p-2 italic">Terminate_Session</button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white p-2 italic">Auth_Gateway</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-surface border-t border-brand-border py-12 px-4 mt-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <Link to="/" className="text-lg font-bold tracking-tight text-white mb-4 block">MEDIX OS</Link>
        <p className="text-gray-500 max-w-sm text-xs leading-relaxed">
          High-performance pharmaceutical delivery interface. Real-time inventory tracking and automated procurement systems.
        </p>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Navigation</h4>
        <div className="flex flex-col gap-2 text-gray-500 text-xs">
          <Link to="/" className="hover:text-teal-400 transition-colors italic">Dashboard</Link>
          <Link to="/orders" className="hover:text-teal-400 transition-colors italic">Catalog</Link>
          <Link to="/cart" className="hover:text-teal-400 transition-colors italic">Cart</Link>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Operations</h4>
        <p className="text-gray-500 text-xs">
          Terminal Status: <span className="text-green-500 font-mono">STABLE</span><br/>
          Region: AP-SOUTH-1
        </p>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-[10px] uppercase tracking-widest">
      &copy; {new Date().getFullYear()} MEDIX OS // PHARMA DELIV SYSTEMS.
    </div>
  </footer>
);

// --- Pages ---

const HomePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get("/medicines").then(res => {
      setMedicines(res.data);
      setLoading(false);
    });
  }, []);

  const filteredMedicines = medicines.filter((m: any) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Inventory Status: Live / Verified</span>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
        >
          Medicine <span className="text-teal-400 italic">Inventory</span>
        </motion.h1>
        
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-teal-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search SKU, name, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1D] border border-gray-800 rounded px-11 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-600">CMD + K</div>
        </div>
      </section>

      {/* Stats Summary from Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-12">
          <div className="bg-[#121214] p-3 border border-gray-800 rounded">
            <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Catalog Items</div>
            <div className="text-xl font-mono text-white font-bold">{filteredMedicines.length.toString().padStart(2, '0')}</div>
          </div>
          <div className="bg-[#121214] p-3 border border-gray-800 rounded">
            <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Avg Response</div>
            <div className="text-xl font-mono text-teal-400 font-bold">14ms</div>
          </div>
          <div className="bg-[#121214] p-3 border border-gray-800 rounded">
            <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Active Nodes</div>
            <div className="text-xl font-mono text-white font-bold">08</div>
          </div>
          <div className="bg-[#121214] p-3 border border-gray-800 rounded">
            <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">System Load</div>
            <div className="text-xl font-mono text-white font-bold italic">Stable</div>
          </div>
        </div>

      {/* Medicines Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Catalog Data Retrieval</h2>
            <div className="flex gap-1">
                <button className="px-2 py-1 text-[9px] bg-gray-800 rounded border border-gray-700 font-bold">GRID_V1</button>
                <button className="px-2 py-1 text-[9px] bg-gray-900 rounded border border-gray-700 text-gray-600 font-bold">LIST_VIEW</button>
            </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 bg-gray-900 p-1 rounded border border-gray-800">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[#121214] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-900 p-1 rounded border border-gray-800">
            {filteredMedicines.map((medicine: any) => (
              <motion.div 
                key={medicine.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative bg-[#121214] p-4 flex flex-col justify-between border border-transparent hover:border-teal-500/50 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1 font-bold border border-teal-500/20 uppercase tracking-tighter">Approved</span>
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">#{medicine.id.slice(0, 5)}</span>
                  </div>
                  
                  <div className="aspect-square mb-4 overflow-hidden rounded bg-black/20">
                    <img 
                        src={medicine.image} 
                        alt={medicine.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight leading-tight">{medicine.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 italic leading-tight">{medicine.company}</p>
                </div>

                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Pricing</div>
                    <div className="text-sm font-mono font-bold text-white tracking-widest">₹{medicine.price}</div>
                  </div>
                  <button 
                    onClick={() => addToCart(medicine)}
                    className="text-[10px] bg-teal-600/10 text-teal-400 px-3 py-1.5 rounded border border-teal-500/20 font-bold uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all shadow-lg shadow-teal-500/5"
                  >
                    + Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [address, setAddress] = useState("");

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    if (!address) return alert("Please enter delivery address");
    
    setOrdering(true);
    try {
      const res = await api.post("/orders", { items: cart, address, total });
      const { order, razorpayOrder, message } = res.data;
      
      console.log("Order created:", order);
      
      if (razorpayOrder) {
        // Real Razorpay modal logic would go here
        // For this environment, we'll simulate verification after a timeout
        alert("Simulating Razorpay Payment Gateway... (Keys provided in .env would trigger real modal)");
      }
      
      // Verify payment (simulated for preview)
      await api.post("/payments/verify", { orderId: order.id });
      
      navigate('/orders');
      // Clear cart? done in provider logic
      window.location.reload(); // Quick way to clear cart state if provider doesn't handle it
    } catch (err) {
      console.error(err);
    } finally {
      setOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 px-4 flex flex-col items-center min-h-[60vh] justify-center">
        <ShoppingCart size={64} className="text-gray-700 mb-6" />
        <h2 className="text-white text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-white text-black px-8 py-3 rounded-full font-bold">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-8 uppercase tracking-widest">Order <span className="text-teal-500 underline decoration-2">Queue</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-2">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-[#121214] border border-gray-800 rounded p-4 flex gap-4 items-center">
              <img src={item.image} className="w-16 h-16 rounded object-cover grayscale opacity-60" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm uppercase tracking-tight">{item.name}</h3>
                <p className="text-gray-500 text-[10px] font-mono">ID: {item.id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-4 bg-black p-2 rounded border border-gray-800 scale-90">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-600 hover:text-white"><Minus size={14} /></button>
                <span className="text-teal-400 font-mono text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-600 hover:text-white"><Plus size={14} /></button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-white font-mono text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-700 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#121214] border border-gray-800 rounded p-6 h-fit space-y-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Total Manifest</h2>
          <div className="space-y-3 text-[11px] font-mono">
            <div className="flex justify-between text-gray-500">
              <span className="uppercase">Subtotal_base</span>
              <span className="text-white">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span className="uppercase">Trans_port</span>
              <span className="text-green-500 tracking-tighter">COMPLIMENTARY</span>
            </div>
            <div className="pt-3 border-t border-gray-800 flex justify-between text-white text-lg font-bold">
              <span className="uppercase tracking-tighter">Gross_total</span>
              <span className="text-teal-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Endpoint Destination</label>
            <textarea 
              className="w-full bg-black border border-gray-800 rounded p-3 text-xs text-white resize-none h-20 focus:border-teal-500 outline-none font-mono"
              placeholder="Coordinates, Address, Node Info..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button 
            onClick={handleCheckout}
            disabled={ordering}
            className="w-full bg-teal-600 text-white py-3 rounded font-bold hover:bg-teal-500 transition-all disabled:opacity-50 uppercase text-xs tracking-widest shadow-lg shadow-teal-600/10"
          >
            {ordering ? "TRANSCRIPTING..." : "COMMIT ORDER"}
          </button>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
              <span className="h-px bg-gray-800 flex-1"></span>
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-gray-500">SSL_ENCRYPTED_GATEWAY</span>
              <span className="h-px bg-gray-800 flex-1"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my-orders").then(res => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-8 uppercase tracking-widest">Order <span className="text-teal-500 underline decoration-2">Logs</span></h1>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[#121214] rounded border border-gray-800" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-[#121214] border border-gray-800 rounded">
          <Clock className="mx-auto text-gray-800 mb-4" size={48} />
          <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">No Records Found // Null Output</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-[#121214] border border-gray-800 rounded overflow-hidden">
              <div className="bg-black/20 p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 flex items-center justify-center rounded">
                    <Package size={16} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Log ID</p>
                    <p className="text-white font-mono text-xs">#{order.id.slice(0, 12)}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Status Code</p>
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                    )}>
                        {order.status}
                    </span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Line Items</p>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center group">
                      <img src={item.medicine.image} className="w-8 h-8 rounded border border-gray-800 grayscale opacity-40 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1">
                        <p className="text-white font-bold text-xs uppercase tracking-tight">{item.medicine.name}</p>
                        <p className="text-gray-500 text-[10px] font-mono">Q: {item.quantity} [₹{item.priceAtTime}]</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-1 border-l border-gray-800/50 pl-6 space-y-2">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Metadata</p>
                    <p className="text-gray-400 text-[10px] leading-relaxed font-mono">ADDR: {order.address.slice(0, 50)}...</p>
                    <p className="text-gray-400 text-[10px] font-mono">PAY: {order.paymentStatus.toUpperCase()}</p>
                </div>
                <div className="md:col-span-1 text-right flex flex-col justify-end">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Gross Value</p>
                    <p className="text-white text-xl font-mono font-bold tracking-tighter">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="pt-32 px-4 flex justify-center min-h-screen bg-[#050505]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full"
      >
        <div className="bg-[#121214] border border-gray-800 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="text-teal-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase">User Authentication</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: Restricted Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Identity_Token</label>
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full bg-[#1A1A1D] border border-gray-800 rounded py-3 px-4 text-sm text-white outline-none focus:border-teal-500 transition-colors font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Access_Secret</label>
              <input 
                type="password" 
                placeholder="Password"
                required
                className="w-full bg-[#1A1A1D] border border-gray-800 rounded py-3 px-4 text-sm text-white outline-none focus:border-teal-500 transition-colors font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-teal-600 text-white py-3 rounded font-bold hover:bg-teal-500 transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-teal-500/10 mt-2">
              Sync Account
            </button>
          </form>

          <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest mt-8">
            No record? <Link to="/register" className="text-teal-400 hover:underline">Register Endpoint</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const RegisterPage = () => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="pt-32 px-4 flex justify-center min-h-screen bg-[#050505]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full"
      >
        <div className="bg-[#121214] border border-gray-800 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-teal-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase">Registry Node</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: Open Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Entity_Name</label>
              <input 
                type="text" 
                placeholder="Full Name"
                required
                className="w-full bg-[#1A1A1D] border border-gray-800 rounded py-3 px-4 text-sm text-white outline-none focus:border-teal-500 transition-colors font-mono"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Identity_Token</label>
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full bg-[#1A1A1D] border border-gray-800 rounded py-3 px-4 text-sm text-white outline-none focus:border-teal-500 transition-colors font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Access_Secret</label>
              <input 
                type="password" 
                placeholder="Password"
                required
                className="w-full bg-[#1A1A1D] border border-gray-800 rounded py-3 px-4 text-sm text-white outline-none focus:border-teal-500 transition-colors font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-teal-600 text-white py-3 rounded font-bold hover:bg-teal-500 transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-teal-500/10 mt-2">
              Provision Account
            </button>
          </form>

          <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest mt-8">
            Existing record? <Link to="/login" className="text-teal-400 hover:underline">Auth Gateway</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('medicines');
    const [newMed, setNewMed] = useState({ name: '', company: '', price: '', stock: '', description: '', image: '' });

    useEffect(() => {
        if (user?.role !== 'admin') navigate('/');
        fetchData();
    }, [user]);

    const fetchData = () => {
        api.get("/medicines").then(res => setMedicines(res.data));
        api.get("/admin/orders").then(res => setOrders(res.data)).catch(console.error);
    };

    const handleAddMedicine = async (e: any) => {
        e.preventDefault();
        try {
            await api.post("/admin/medicines", { ...newMed, price: Number(newMed.price), stock: Number(newMed.stock) });
            setNewMed({ name: '', company: '', price: '', stock: '', description: '', image: '' });
            fetchData();
        } catch (err) {
            alert("Failed to add medicine");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this medicine?")) {
            await api.delete(`/api/admin/medicines/${id}`);
            fetchData();
        }
    };

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
            <div className="flex items-end gap-3 mb-12">
                <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Admin <span className="text-teal-500">Terminal</span></h1>
                <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded font-mono">v1.2.4-STABLE</span>
            </div>
            
            <div className="flex gap-1 mb-8 bg-gray-900/50 p-1 rounded-lg border border-gray-800 w-fit">
                <button 
                    onClick={() => setTab('medicines')}
                    className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded", tab === 'medicines' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-400')}
                >
                    Medicine Catalog
                </button>
                <button 
                    onClick={() => setTab('orders')}
                    className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded", tab === 'orders' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-400')}
                >
                    Order Manifests
                </button>
            </div>

            {tab === 'medicines' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#121214] border border-gray-800 rounded p-6 sticky top-24">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 underline underline-offset-8 decoration-teal-500/30">Append Records</h2>
                            <form onSubmit={handleAddMedicine} className="space-y-3">
                                <input placeholder="Product Name" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono focus:border-teal-500 outline-none" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                                <input placeholder="Manufacturer" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono focus:border-teal-500 outline-none" value={newMed.company} onChange={e => setNewMed({...newMed, company: e.target.value})} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Unit Price" type="number" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono focus:border-teal-500 outline-none" value={newMed.price} onChange={e => setNewMed({...newMed, price: e.target.value})} />
                                    <input placeholder="Base Stock" type="number" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono focus:border-teal-500 outline-none" value={newMed.stock} onChange={e => setNewMed({...newMed, stock: e.target.value})} />
                                </div>
                                <textarea placeholder="Description Blob" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono h-24 focus:border-teal-500 outline-none" value={newMed.description} onChange={e => setNewMed({...newMed, description: e.target.value})} />
                                <input placeholder="Image Resource URL" required className="w-full bg-black border border-gray-800 rounded p-2.5 text-white text-[11px] font-mono focus:border-teal-500 outline-none" value={newMed.image} onChange={e => setNewMed({...newMed, image: e.target.value})} />
                                <button className="w-full bg-teal-600 text-white py-3 rounded font-bold hover:bg-teal-500 transition-all uppercase text-[10px] tracking-widest">Commit to DB</button>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                        {medicines.map((m: any) => (
                            <div key={m.id} className="bg-[#121214] border border-gray-800 rounded p-3 flex gap-4 items-center group">
                                <img src={m.image} className="w-12 h-12 rounded bg-black/20 object-cover grayscale opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-tight">{m.name}</h3>
                                    <p className="text-gray-500 text-[9px] font-mono uppercase">SKU: {m.id.slice(0, 8)} | Stock: {m.stock} units</p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className="text-teal-400 font-mono text-sm">₹{m.price}</span>
                                    <button onClick={() => handleDelete(m.id)} className="text-gray-700 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o: any) => (
                        <div key={o.id} className="bg-[#121214] border border-gray-800 rounded overflow-hidden">
                            <div className="bg-black/20 p-4 border-b border-gray-800 flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-xs uppercase tracking-tight">{o.user?.name}</p>
                                    <p className="text-gray-600 text-[10px] font-mono">{o.user?.email}</p>
                                </div>
                                <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border", o.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20')}>{o.status}</span>
                            </div>
                            <div className="p-4 bg-gray-900/10">
                                {o.items?.map((i: any) => (
                                    <div key={i.id} className="text-[10px] text-gray-500 flex justify-between font-mono mb-1">
                                        <span className="uppercase">{i.medicine?.name} x {i.quantity}</span>
                                        <span className="text-gray-400">₹{i.priceAtTime}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-800/50 flex justify-between items-center bg-black/10">
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Gross Manifest Value: <span className="text-teal-400 font-mono font-bold text-sm ml-2">₹{o.total}</span></p>
                                <p className="text-gray-600 font-mono text-[10px]">{new Date(o.createdAt).toISOString().replace('T', ' ').slice(0, 19)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main App & Provider Setup ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const authValue = {
    user,
    login: async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    },
    register: async (email: string, password: string, name: string) => {
      const res = await api.post('/auth/register', { email, password, name });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const cartValue = {
    cart,
    addToCart: (medicine: any) => {
      setCart(prev => {
        const existing = prev.find(item => item.id === medicine.id);
        if (existing) {
          return prev.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...medicine, quantity: 1 }];
      });
    },
    removeFromCart: (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
    },
    updateQuantity: (id: string, quantity: number) => {
      if (quantity < 1) return;
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    },
    total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    clearCart: () => setCart([])
  };

  if (loading) return null;

  return (
    <Router>
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={cartValue}>
          <div className="min-h-screen bg-[#0A0A0B] text-gray-200 font-sans selection:bg-teal-500 selection:text-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <Footer />
          </div>
        </CartContext.Provider>
      </AuthContext.Provider>
    </Router>
  );
}
