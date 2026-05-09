const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inventory = [
  // Computer Lab - Room 112
  { name: 'Desktop PC', category: 'computer', quantity: 30, condition: 'good', location: 'Computer Lab - Room 112' },
  { name: 'Keyboard', category: 'computer', quantity: 30, condition: 'good', location: 'Computer Lab - Room 112' },
  { name: 'Mouse', category: 'computer', quantity: 30, condition: 'good', location: 'Computer Lab - Room 112' },
  { name: 'Monitor', category: 'computer', quantity: 30, condition: 'good', location: 'Computer Lab - Room 112' },
  { name: 'UPS', category: 'computer', quantity: 15, condition: 'good', location: 'Computer Lab - Room 112' },
  { name: 'LAN Cable', category: 'computer', quantity: 20, condition: 'good', location: 'Computer Lab - Room 112' },

  // Physics Lab - Room 010
  { name: 'Ultrasonic Interferometer', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Diffraction Grating Setup', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Law of Malus Kit', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'LASER Source', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Band Gap Energy Kit', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Hall Effect Setup', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Solar Cell Panel', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Resonance Tube', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Sound Level Meter', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Ultrasonic Distance Meter', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Tuning Fork Set', category: 'instrument', quantity: 6, condition: 'good', location: 'Physics Lab - Room 010' },
  { name: 'Optical Bench', category: 'instrument', quantity: 4, condition: 'good', location: 'Physics Lab - Room 010' },

  // Chemistry Lab - Room 011
  { name: 'Bunsen Burner', category: 'instrument', quantity: 12, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Beakers', category: 'instrument', quantity: 40, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Test Tubes', category: 'instrument', quantity: 80, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Conical Flask', category: 'instrument', quantity: 20, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Measuring Cylinder', category: 'instrument', quantity: 15, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'pH Meter', category: 'instrument', quantity: 6, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Conductometer', category: 'instrument', quantity: 4, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Spectrophotometer', category: 'instrument', quantity: 2, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Electroplating Setup', category: 'instrument', quantity: 4, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Tripod Stand', category: 'instrument', quantity: 12, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Pipette', category: 'instrument', quantity: 20, condition: 'good', location: 'Chemistry Lab - Room 011' },

  // Chemicals - Chemistry Lab
  { name: 'HCl (Hydrochloric Acid)', category: 'chemical', quantity: 5, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'H₂SO₄ (Sulphuric Acid)', category: 'chemical', quantity: 5, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'NaOH (Sodium Hydroxide)', category: 'chemical', quantity: 5, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'HNO₃ (Nitric Acid)', category: 'chemical', quantity: 4, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Ethanol', category: 'chemical', quantity: 6, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'Distilled Water', category: 'chemical', quantity: 20, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'KMnO₄ (Potassium Permanganate)', category: 'chemical', quantity: 3, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'CuSO₄ (Copper Sulphate)', category: 'chemical', quantity: 3, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'EDTA Solution', category: 'chemical', quantity: 4, condition: 'good', location: 'Chemistry Lab - Room 011' },
  { name: 'pH Buffer Solution', category: 'chemical', quantity: 4, condition: 'good', location: 'Chemistry Lab - Room 011' },
];

async function main() {
  console.log('Seeding inventory...');
  for (const item of inventory) {
    await prisma.inventory.create({ data: item });
  }
  console.log('Done! Added', inventory.length, 'items.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
