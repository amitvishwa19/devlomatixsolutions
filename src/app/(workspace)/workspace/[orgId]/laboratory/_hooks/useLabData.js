import { useState, useCallback, useEffect } from 'react';
import { orderService, patientService, testService, qcService, alertService, specimenService } from '@/services/labService';
import { toast } from 'sonner';

// Hook for managing lab orders with CRUD operations
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = orderService.getAll();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((orderData) => {
    const newOrder = orderService.create(orderData);
    setOrders(prev => [newOrder, ...prev]);
    toast.success('Lab order created successfully');
    return newOrder;
  }, []);

  const update = useCallback((id, updates) => {
    const updated = orderService.update(id, updates);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      toast.success('Order updated successfully');
    }
    return updated;
  }, []);

  const updateStatus = useCallback((id, status) => {
    const updated = orderService.updateStatus(id, status);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      toast.success(`Order status updated to ${status}`);
    }
    return updated;
  }, []);

  const remove = useCallback((id) => {
    const success = orderService.delete(id);
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Order deleted successfully');
    }
    return success;
  }, []);

  const addResult = useCallback((id, resultData) => {
    const updated = orderService.addResult(id, resultData);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      toast.success('Result added successfully');
    }
    return updated;
  }, []);

  const search = useCallback((query) => {
    return orderService.search(query);
  }, []);

  const getStats = useCallback(() => {
    return orderService.getStats();
  }, []);

  return {
    orders,
    loading,
    refresh,
    create,
    update,
    updateStatus,
    remove,
    addResult,
    search,
    getStats,
  };
}

// Hook for managing patients
export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = patientService.getAll();
    setPatients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((patientData) => {
    const newPatient = patientService.create(patientData);
    setPatients(prev => [...prev, newPatient]);
    toast.success('Patient created successfully');
    return newPatient;
  }, []);

  const update = useCallback((id, updates) => {
    const updated = patientService.update(id, updates);
    if (updated) {
      setPatients(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Patient updated successfully');
    }
    return updated;
  }, []);

  const remove = useCallback((id) => {
    const success = patientService.delete(id);
    if (success) {
      setPatients(prev => prev.filter(p => p.id !== id));
      toast.success('Patient deleted successfully');
    }
    return success;
  }, []);

  const search = useCallback((query) => {
    return patientService.search(query);
  }, []);

  return {
    patients,
    loading,
    refresh,
    create,
    update,
    remove,
    search,
  };
}

// Hook for managing lab tests
export function useTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = testService.getAll();
    setTests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((testData) => {
    const newTest = testService.create(testData);
    setTests(prev => [...prev, newTest]);
    toast.success('Test created successfully');
    return newTest;
  }, []);

  const update = useCallback((id, updates) => {
    const updated = testService.update(id, updates);
    if (updated) {
      setTests(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Test updated successfully');
    }
    return updated;
  }, []);

  const remove = useCallback((id) => {
    const success = testService.delete(id);
    if (success) {
      setTests(prev => prev.filter(t => t.id !== id));
      toast.success('Test deleted successfully');
    }
    return success;
  }, []);

  const toggleActive = useCallback((id) => {
    const updated = testService.toggleActive(id);
    if (updated) {
      setTests(prev => prev.map(t => t.id === id ? updated : t));
      toast.success(`Test ${updated.isActive ? 'activated' : 'deactivated'}`);
    }
    return updated;
  }, []);

  const getCategories = useCallback(() => {
    return testService.getCategories();
  }, []);

  return {
    tests,
    loading,
    refresh,
    create,
    update,
    remove,
    toggleActive,
    getCategories,
  };
}

// Hook for specimen tracking
export function useSpecimenTracking() {
  const collectSpecimen = useCallback((orderId, collectedBy) => {
    const result = specimenService.collectSpecimen(orderId, collectedBy);
    if (result) toast.success('Specimen collected');
    return result;
  }, []);

  const receiveSpecimen = useCallback((orderId, receivedBy) => {
    const result = specimenService.receiveSpecimen(orderId, receivedBy);
    if (result) toast.success('Specimen received at lab');
    return result;
  }, []);

  const processSpecimen = useCallback((orderId, processedBy) => {
    const result = specimenService.processSpecimen(orderId, processedBy);
    if (result) toast.success('Specimen processing started');
    return result;
  }, []);

  const storeSpecimen = useCallback((orderId, storedBy, location) => {
    const result = specimenService.storeSpecimen(orderId, storedBy, location);
    if (result) toast.success('Specimen stored');
    return result;
  }, []);

  const rejectSpecimen = useCallback((orderId, rejectedBy, reason) => {
    const result = specimenService.rejectSpecimen(orderId, rejectedBy, reason);
    if (result) toast.error('Specimen rejected');
    return result;
  }, []);

  return {
    collectSpecimen,
    receiveSpecimen,
    processSpecimen,
    storeSpecimen,
    rejectSpecimen,
  };
}

// Hook for QC samples
export function useQCSamples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = qcService.getAll();
    setSamples(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((sampleData) => {
    const newSample = qcService.create(sampleData);
    setSamples(prev => [...prev, newSample]);
    toast.success('QC sample created');
    return newSample;
  }, []);

  const addResult = useCallback((sampleId, resultData) => {
    const updated = qcService.addResult(sampleId, resultData);
    if (updated) {
      setSamples(prev => prev.map(s => s.id === sampleId ? updated : s));
      toast.success('QC result added');
    }
    return updated;
  }, []);

  const remove = useCallback((id) => {
    const success = qcService.delete(id);
    if (success) {
      setSamples(prev => prev.filter(s => s.id !== id));
      toast.success('QC sample deleted');
    }
    return success;
  }, []);

  return {
    samples,
    loading,
    refresh,
    create,
    addResult,
    remove,
  };
}

// Hook for critical alerts
export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = alertService.getAll();
    setAlerts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((alertData) => {
    const newAlert = alertService.create(alertData);
    setAlerts(prev => [newAlert, ...prev]);
    toast.error(`Critical Alert: ${alertData.criticalMsg}`, { duration: 10000 });
    return newAlert;
  }, []);

  const acknowledge = useCallback((id, acknowledgedBy) => {
    const updated = alertService.acknowledge(id, acknowledgedBy);
    if (updated) {
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
      toast.success('Alert acknowledged');
    }
    return updated;
  }, []);

  const getUnacknowledged = useCallback(() => {
    return alertService.getUnacknowledged();
  }, []);

  return {
    alerts,
    loading,
    refresh,
    create,
    acknowledge,
    getUnacknowledged,
  };
}
