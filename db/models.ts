import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index.ts';

// --- User Model ---
interface UserAttributes {
  id: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  name: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: 'user' | 'admin';
  public name!: string;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { sequelize, modelName: 'user' });

// --- Medicine Model ---
interface MedicineAttributes {
  id: string;
  name: string;
  company: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

interface MedicineCreationAttributes extends Optional<MedicineAttributes, 'id'> {}

export class Medicine extends Model<MedicineAttributes, MedicineCreationAttributes> implements MedicineAttributes {
  public id!: string;
  public name!: string;
  public company!: string;
  public price!: number;
  public image!: string;
  public description!: string;
  public stock!: number;
}

Medicine.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, modelName: 'medicine' });

// --- Order Model ---
interface OrderAttributes {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  razorpayOrderId?: string;
  address: string;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public userId!: string;
  public total!: number;
  public status!: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  public paymentStatus!: 'unpaid' | 'paid';
  public razorpayOrderId?: string;
  public address!: string;
}

Order.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  paymentStatus: { type: DataTypes.ENUM('unpaid', 'paid'), defaultValue: 'unpaid' },
  razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'order' });

// --- OrderItem Model ---
interface OrderItemAttributes {
  id: string;
  orderId: string;
  medicineId: string;
  quantity: number;
  priceAtTime: number;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public medicineId!: string;
  public quantity!: number;
  public priceAtTime!: number;
}

OrderItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: { type: DataTypes.UUID, allowNull: false },
  medicineId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  priceAtTime: { type: DataTypes.FLOAT, allowNull: false },
}, { sequelize, modelName: 'orderItem' });

// --- Associations ---
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });
Medicine.hasMany(OrderItem, { foreignKey: 'medicineId' });
