import { Sequelize } from 'sequelize';
import path from 'path';

// Use SQLite for the preview environment as it's easier to set up without infrastructure.
// For production with MySQL, change the dialect and connection options.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  logging: false,
});

export default sequelize;
