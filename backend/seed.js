const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  const users = [
    { name: 'John Employee', email: 'employee@demo.com', password: 'password123', role: 'employee', department: 'Engineering' },
    { name: 'Sarah Director', email: 'director@demo.com', password: 'password123', role: 'director', department: 'Management' },
    { name: 'Mike Accounts', email: 'accounts@demo.com', password: 'password123', role: 'accounts', department: 'Finance' },
  ];

  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 10);
    const [created] = await User.findOrCreate({ 
      where: { email: user.email }, 
      defaults: user 
    });
    if (created) {
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log('✅ Demo users seeded successfully!');
  process.exit();
}

seed().catch(err => {
  console.error('❌ Error seeding:', err);
  process.exit(1);
});