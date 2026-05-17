import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import sequelize from "./db/index.ts";
import { User, Medicine, Order, OrderItem } from "./db/models.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

app.use(express.json());

// --- Authentication Middleware ---
interface AuthRequest extends express.Request {
  user?: any;
}

const authenticate = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

// --- Razorpay Setup ---
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// --- API Routes ---

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name, role: 'user' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Medicines
app.get("/api/medicines", async (req, res) => {
  const medicines = await Medicine.findAll();
  res.json(medicines);
});

app.get("/api/medicines/:id", async (req, res) => {
  const medicine = await Medicine.findByPk(req.params.id);
  if (!medicine) return res.status(404).json({ error: "Not found" });
  res.json(medicine);
});

// Admin Only Routes
app.post("/api/admin/medicines", authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.json(medicine);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.put("/api/admin/medicines/:id", authenticate, isAdmin, async (req: AuthRequest, res) => {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ error: "Not found" });
    await medicine.update(req.body);
    res.json(medicine);
});

app.delete("/api/admin/medicines/:id", authenticate, isAdmin, async (req: AuthRequest, res) => {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ error: "Not found" });
    await medicine.destroy();
    res.json({ success: true });
});

app.get("/api/admin/orders", authenticate, isAdmin, async (req: AuthRequest, res) => {
    const orders = await Order.findAll({
        include: [{ model: User, attributes: ['name', 'email'] }, { model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }]
    });
    res.json(orders);
});

// User Orders
app.post("/api/orders", authenticate, async (req: AuthRequest, res) => {
  const { items, address, total } = req.body;
  try {
    const order = await Order.create({
      userId: req.user.id,
      total,
      address,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        medicineId: item.id,
        quantity: item.quantity,
        priceAtTime: item.price
      });
    }

    if (razorpay) {
      const rpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // in paise
        currency: "INR",
        receipt: order.id,
      });
      await order.update({ razorpayOrderId: rpOrder.id });
      res.json({ order, razorpayOrder: rpOrder });
    } else {
      // Return order but indicate dummy payment for preview
      res.json({ order, message: "Razorpay keys missing, proceeding with dummy payment" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

app.get("/api/orders/my-orders", authenticate, async (req: AuthRequest, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(orders);
});

app.post("/api/payments/verify", authenticate, async (req: AuthRequest, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findByPk(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (razorpay && order.razorpayOrderId) {
    const body = order.razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      await order.update({ paymentStatus: "paid" });
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } else {
    // Dummy verification
    await order.update({ paymentStatus: "paid" });
    res.json({ success: true, message: "Dummy payment verified" });
  }
});

// --- Vite Middleware & Static Serving ---
async function startServer() {
  await sequelize.sync();

  // Seed some medicines if empty
  const count = await Medicine.count();
  if (count === 0) {
    await Medicine.bulkCreate([
      { name: "Paracetamol 500mg", company: "GlaxoSmithKline", price: 15.5, stock: 100, description: "Common pain reliever and fever reducer.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60" },
      { name: "Amoxicillin 250mg", company: "Abbott", price: 120.0, stock: 50, description: "Antibiotic used to treat bacterial infections.", image: "https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?w=800&auto=format&fit=crop&q=60" },
      { name: "Cetirizine 10mg", company: "Sun Pharma", price: 45.0, stock: 200, description: "Antihistamine used to treat allergies.", image: "https://images.unsplash.com/photo-1550572017-ed20015dd085?w=800&auto=format&fit=crop&q=60" },
      { name: "Metformin 500mg", company: "Merck", price: 85.0, stock: 150, description: "Medication for type 2 diabetes management.", image: "https://images.unsplash.com/photo-1576071804486-b8bc22106dbf?w=800&auto=format&fit=crop&q=60" },
    ]);

    // Create a default admin
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    await User.create({ email: "admin@medflash.com", password: hashedAdminPassword, name: "Admin User", role: "admin" });
    console.log("Admin account created: admin@medflash.com / admin123");
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
