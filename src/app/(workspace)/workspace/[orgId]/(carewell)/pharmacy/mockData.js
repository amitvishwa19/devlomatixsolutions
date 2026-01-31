/* Pharmacy Mock Data - Updated */
import { subDays, addDays, addMonths, subMonths } from 'date-fns';

const now = new Date();

export const mockInventory = [
  { id: 'med-001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', quantity: 500, unit: 'tablets', reorderLevel: 100, batchNumber: 'PCM-2024-001', expiryDate: addMonths(now, 18), costPrice: 1.5, sellingPrice: 2, supplier: 'PharmaCorp', location: 'A1-01', manufacturer: 'Sun Pharma' },
  { id: 'med-002', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', quantity: 80, unit: 'capsules', reorderLevel: 100, batchNumber: 'AMX-2024-015', expiryDate: addMonths(now, 12), costPrice: 6, sellingPrice: 8, supplier: 'MediSupply', location: 'B2-03', manufacturer: 'Cipla' },
  { id: 'med-003', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', quantity: 300, unit: 'tablets', reorderLevel: 150, batchNumber: 'MET-2024-008', expiryDate: addMonths(now, 24), costPrice: 2, sellingPrice: 3, supplier: 'PharmaCorp', location: 'A2-05', manufacturer: 'Dr. Reddy' },
  { id: 'med-004', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', quantity: 200, unit: 'tablets', reorderLevel: 100, batchNumber: 'AML-2024-003', expiryDate: addDays(now, 25), costPrice: 3.5, sellingPrice: 5, supplier: 'HealthMeds', location: 'C1-02', manufacturer: 'Lupin' },
  { id: 'med-005', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', quantity: 150, unit: 'capsules', reorderLevel: 80, batchNumber: 'OMP-2024-012', expiryDate: addMonths(now, 8), costPrice: 4, sellingPrice: 6, supplier: 'MediSupply', location: 'B1-04', manufacturer: 'Torrent' },
  { id: 'med-006', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', quantity: 45, unit: 'tablets', reorderLevel: 50, batchNumber: 'CTZ-2024-007', expiryDate: addMonths(now, 15), costPrice: 2.5, sellingPrice: 4, supplier: 'PharmaCorp', location: 'A3-01', manufacturer: 'Alkem' },
  { id: 'med-007', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', quantity: 60, unit: 'tablets', reorderLevel: 40, batchNumber: 'AZT-2024-020', expiryDate: addMonths(now, 10), costPrice: 18, sellingPrice: 25, supplier: 'HealthMeds', location: 'B3-02', manufacturer: 'Cipla' },
  { id: 'med-008', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Statin', quantity: 180, unit: 'tablets', reorderLevel: 100, batchNumber: 'ATV-2024-005', expiryDate: addMonths(now, 20), costPrice: 8, sellingPrice: 12, supplier: 'MediSupply', location: 'C2-03', manufacturer: 'Sun Pharma' },
  { id: 'med-009', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', quantity: 250, unit: 'tablets', reorderLevel: 100, batchNumber: 'IBU-2024-011', expiryDate: addMonths(now, 16), costPrice: 2, sellingPrice: 3.5, supplier: 'PharmaCorp', location: 'A1-03', manufacturer: 'Abbott' },
  { id: 'med-010', name: 'Losartan 50mg', genericName: 'Losartan Potassium', category: 'Antihypertensive', quantity: 120, unit: 'tablets', reorderLevel: 80, batchNumber: 'LOS-2024-009', expiryDate: addMonths(now, 14), costPrice: 5, sellingPrice: 7, supplier: 'HealthMeds', location: 'C1-04', manufacturer: 'Zydus' },
  { id: 'med-011', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'PPI', quantity: 90, unit: 'tablets', reorderLevel: 60, batchNumber: 'PAN-2024-006', expiryDate: addDays(now, 15), costPrice: 4, sellingPrice: 6, supplier: 'MediSupply', location: 'B1-02', manufacturer: 'Alkem' },
  { id: 'med-012', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', quantity: 75, unit: 'tablets', reorderLevel: 50, batchNumber: 'CIP-2024-018', expiryDate: addMonths(now, 11), costPrice: 10, sellingPrice: 15, supplier: 'PharmaCorp', location: 'B2-01', manufacturer: 'Cipla' },
];

export const mockDispensing = [
  { id: 'disp-001', patientName: 'Rahul Sharma', patientId: 'P001', medicineName: 'Metformin 500mg', medicineId: 'med-003', quantity: 30, dispensedAt: subDays(now, 0), prescriptionId: 'rx-001', dispensedBy: 'Dr. Patel' },
  { id: 'disp-002', patientName: 'Priya Patel', patientId: 'P002', medicineName: 'Amlodipine 5mg', medicineId: 'med-004', quantity: 30, dispensedAt: subDays(now, 0), prescriptionId: 'rx-002', dispensedBy: 'Dr. Sharma' },
  { id: 'disp-003', patientName: 'Amit Kumar', patientId: 'P003', medicineName: 'Azithromycin 500mg', medicineId: 'med-007', quantity: 6, dispensedAt: subDays(now, 1), prescriptionId: 'rx-003', dispensedBy: 'Dr. Patel' },
  { id: 'disp-004', patientName: 'Sunita Devi', patientId: 'P004', medicineName: 'Omeprazole 20mg', medicineId: 'med-005', quantity: 14, dispensedAt: subDays(now, 1), prescriptionId: 'rx-004', dispensedBy: 'Dr. Gupta' },
  { id: 'disp-005', patientName: 'Vikram Singh', patientId: 'P005', medicineName: 'Atorvastatin 20mg', medicineId: 'med-008', quantity: 30, dispensedAt: subDays(now, 2), prescriptionId: 'rx-005', dispensedBy: 'Dr. Sharma' },
  { id: 'disp-006', patientName: 'Meera Joshi', patientId: 'P006', medicineName: 'Paracetamol 500mg', medicineId: 'med-001', quantity: 20, dispensedAt: subDays(now, 2), prescriptionId: 'rx-006', dispensedBy: 'Dr. Patel' },
  { id: 'disp-007', patientName: 'Ravi Menon', patientId: 'P007', medicineName: 'Ciprofloxacin 500mg', medicineId: 'med-012', quantity: 10, dispensedAt: subDays(now, 3), prescriptionId: 'rx-007', dispensedBy: 'Dr. Gupta' },
];

export const mockSuppliers = [
  { id: 'sup-001', name: 'PharmaCorp', contact: 'Rajesh Kumar', email: 'rajesh@pharmacorp.com', phone: '+91 98765 43210', address: 'Mumbai, Maharashtra', gstNumber: '27AABCP1234M1Z5', rating: 4.5, totalOrders: 156, pendingPayment: 45000 },
  { id: 'sup-002', name: 'MediSupply', contact: 'Priya Singh', email: 'priya@medisupply.com', phone: '+91 87654 32109', address: 'Delhi, NCR', gstNumber: '07AABCM5678N2Z8', rating: 4.2, totalOrders: 98, pendingPayment: 28000 },
  { id: 'sup-003', name: 'HealthMeds', contact: 'Amit Patel', email: 'amit@healthmeds.com', phone: '+91 76543 21098', address: 'Ahmedabad, Gujarat', gstNumber: '24AABCH9012P3Z1', rating: 4.7, totalOrders: 203, pendingPayment: 62000 },
];

export const mockPurchaseOrders = [
  { id: 'po-001', orderNumber: 'PO-2024-001', supplier: 'PharmaCorp', supplierId: 'sup-001', items: [{ medicineId: 'med-001', name: 'Paracetamol 500mg', quantity: 1000, unitPrice: 1.5 }, { medicineId: 'med-003', name: 'Metformin 500mg', quantity: 500, unitPrice: 2 }], totalAmount: 2500, status: 'delivered', orderedAt: subDays(now, 10), deliveredAt: subDays(now, 5), paymentStatus: 'paid' },
  { id: 'po-002', orderNumber: 'PO-2024-002', supplier: 'MediSupply', supplierId: 'sup-002', items: [{ medicineId: 'med-002', name: 'Amoxicillin 500mg', quantity: 200, unitPrice: 6 }], totalAmount: 1200, status: 'in_transit', orderedAt: subDays(now, 3), deliveredAt: null, paymentStatus: 'pending' },
  { id: 'po-003', orderNumber: 'PO-2024-003', supplier: 'HealthMeds', supplierId: 'sup-003', items: [{ medicineId: 'med-007', name: 'Azithromycin 500mg', quantity: 100, unitPrice: 18 }, { medicineId: 'med-010', name: 'Losartan 50mg', quantity: 200, unitPrice: 5 }], totalAmount: 2800, status: 'pending', orderedAt: subDays(now, 1), deliveredAt: null, paymentStatus: 'pending' },
  { id: 'po-004', orderNumber: 'PO-2024-004', supplier: 'PharmaCorp', supplierId: 'sup-001', items: [{ medicineId: 'med-006', name: 'Cetirizine 10mg', quantity: 300, unitPrice: 2.5 }], totalAmount: 750, status: 'delivered', orderedAt: subDays(now, 15), deliveredAt: subDays(now, 12), paymentStatus: 'paid' },
];

export const mockCategories = [
  'Analgesic', 'Antibiotic', 'Antidiabetic', 'Antihypertensive', 'PPI', 'Antihistamine', 'Statin', 'NSAID'
];

export const mockSalesData = [
  { date: subDays(now, 6), revenue: 12500, items: 145 },
  { date: subDays(now, 5), revenue: 15800, items: 178 },
  { date: subDays(now, 4), revenue: 11200, items: 132 },
  { date: subDays(now, 3), revenue: 18900, items: 201 },
  { date: subDays(now, 2), revenue: 14500, items: 167 },
  { date: subDays(now, 1), revenue: 16700, items: 189 },
  { date: now, revenue: 9800, items: 98 },
];
