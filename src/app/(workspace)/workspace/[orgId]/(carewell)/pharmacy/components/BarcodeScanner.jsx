import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ScanLine, Camera, Package, Search, AlertTriangle, 
  CheckCircle, Plus, History, Keyboard, Volume2, VolumeX
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function BarcodeScanner({ inventory, onDispense, onAddToCart }) {
  const [scanMode, setScanMode] = React.useState('manual'); // 'manual' | 'camera'
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const [scanHistory, setScanHistory] = React.useState([]);
  const [lastScanned, setLastScanned] = React.useState(null);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [isScanning, setIsScanning] = React.useState(false);
  const inputRef = React.useRef(null);

  // Generate mock barcodes for inventory items
  const barcodeMap = React.useMemo(() => {
    const map = {};
    inventory.forEach(item => {
      // Create a mock barcode based on batch number
      const barcode = `${item.batchNumber?.replace(/-/g, '') || item.id}`;
      map[barcode] = item;
      // Also map by id
      map[item.id] = item;
    });
    return map;
  }, [inventory]);

  // Focus input on mount
  React.useEffect(() => {
    if (inputRef.current && scanMode === 'manual') {
      inputRef.current.focus();
    }
  }, [scanMode]);

  // Play beep sound
  const playBeep = React.useCallback((success = true) => {
    if (!soundEnabled) return;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = success ? 800 : 300;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), success ? 100 : 300);
  }, [soundEnabled]);

  // Handle barcode scan
  const handleScan = React.useCallback((code) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const item = barcodeMap[cleanCode] || Object.values(barcodeMap).find(i => 
        i.batchNumber?.includes(cleanCode) || 
        i.name?.toUpperCase().includes(cleanCode)
      );

      const scanResult = {
        id: Date.now(),
        code: cleanCode,
        timestamp: new Date(),
        found: !!item,
        item: item || null,
      };

      setScanHistory(prev => [scanResult, ...prev.slice(0, 49)]);
      setLastScanned(scanResult);
      setBarcodeInput('');
      setIsScanning(false);
      playBeep(!!item);

      if (item && onAddToCart) {
        onAddToCart(item);
      }
    }, 300);
  }, [barcodeMap, playBeep, onAddToCart]);

  // Handle keyboard input (for USB barcode scanners)
  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Enter' && barcodeInput) {
      handleScan(barcodeInput);
    }
  }, [barcodeInput, handleScan]);

  const getStockStatus = (item) => {
    if (!item) return null;
    const daysToExpiry = differenceInDays(new Date(item.expiryDate), new Date());
    
    if (daysToExpiry <= 0) return { label: 'Expired', variant: 'destructive' };
    if (daysToExpiry <= 30) return { label: 'Expiring Soon', variant: 'warning' };
    if (item.quantity <= item.reorderLevel) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Barcode / QR Scanner
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? '' : 'text-muted-foreground'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="gap-1">
                <History className="w-3 h-3" />
                {scanHistory.length} scans
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual / USB Scanner
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setScanMode('camera')}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera Scan
            </Button>
          </div>

          {/* Manual Input Mode */}
          {scanMode === 'manual' && (
            <div className="space-y-3">
              <div className="relative">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Scan barcode or enter code manually..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  className="pl-9 font-mono text-lg h-12"
                  autoFocus
                />
                {isScanning && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleScan(barcodeInput)}
                  disabled={!barcodeInput || isScanning}
                  className="flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setBarcodeInput('')}
                >
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                USB barcode scanners will automatically submit when scan is complete
              </p>
            </div>
          )}

          {/* Camera Mode */}
          {scanMode === 'camera' && (
            <div className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Camera Scanning</p>
                  <p className="text-sm text-muted-foreground">
                    Position barcode within the frame
                  </p>
                  <Button className="mt-4" variant="outline">
                    Request Camera Access
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Camera-based scanning requires browser permission
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Scanned Result */}
      {lastScanned && (
        <Card className={lastScanned.found 
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30' 
          : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30'
        }>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {lastScanned.found ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              Last Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastScanned.found ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{lastScanned.item.name}</h3>
                    <p className="text-sm text-muted-foreground">{lastScanned.item.genericName}</p>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                      {lastScanned.code}
                    </code>
                  </div>
                  {getStockStatus(lastScanned.item) && (
                    <Badge 
                      variant={getStockStatus(lastScanned.item).variant === 'success' ? 'default' : 'destructive'}
                      className={getStockStatus(lastScanned.item).variant === 'success' ? 'bg-emerald-600' : ''}
                    >
                      {getStockStatus(lastScanned.item).label}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Batch</p>
                    <p className="font-medium">{lastScanned.item.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-medium">{lastScanned.item.quantity} {lastScanned.item.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{lastScanned.item.location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry</p>
                    <p className="font-medium">{format(new Date(lastScanned.item.expiryDate), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => onDispense?.(lastScanned.item)}>
                    <Package className="w-4 h-4 mr-2" />
                    Dispense
                  </Button>
                  <Button variant="outline" onClick={() => onAddToCart?.(lastScanned.item)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-500" />
                <p className="font-medium text-red-600">Medicine Not Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Barcode: <code className="bg-muted px-2 py-0.5 rounded">{lastScanned.code}</code>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This barcode is not registered in the inventory system
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Scan History
            </CardTitle>
            {scanHistory.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setScanHistory([])}
              >
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {scanHistory.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanHistory.slice(0, 10).map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(scan.timestamp, 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{scan.code}</code>
                      </TableCell>
                      <TableCell>
                        {scan.item ? (
                          <span className="font-medium">{scan.item.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {scan.found ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Found
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Not Found
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No scans yet</p>
              <p className="text-sm">Start scanning to see history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
