import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput, Image, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useReceipts } from '@/contexts/receipts-context';
import { useTransactions } from '@/contexts/transactions-context';
import { useCategories } from '@/contexts/categories-context';
import { CategoriesService, ReceiptsService, ReceiptItemsService } from '@/services/api';
import { ReceiptItem } from '@/services/api/types';

interface ExtractedItem {
  id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: number;
  product_code?: string;
}

export default function ScanReceiptReviewScreen() {
  const params = useLocalSearchParams();
  const imageUri = (Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri) as string;
  const receiptIdParam = Array.isArray(params.receiptId) ? params.receiptId[0] : params.receiptId;
  const receiptDataParam = Array.isArray(params.receiptData) ? params.receiptData[0] : params.receiptData;
  const receiptId = receiptIdParam ? parseInt(receiptIdParam as string, 10) : null;
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  
  const { updateReceipt, getReceiptById } = useReceipts();
  const { createTransaction, refreshTransactions } = useTransactions();
  const { expenseCategories, refreshCategories } = useCategories();
  
  const [isLoading, setIsLoading] = useState(!!receiptId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState({
    vendor_name: '',
    receipt_date: new Date().toISOString().split('T')[0],
    total_amount: '0.00',
    tax_amount: '0.00',
    items: [] as ExtractedItem[],
  });

  const parsedReceiptData = (() => {
    if (!receiptDataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(receiptDataParam as string));
    } catch (error: any) {
      console.warn('Failed to parse receiptData param:', error);
      return null;
    }
  })();

  const normalizeReceiptResponse = (response: any): any => {
    if (!response) return response;
    const base =
      response.receipt ||
      response.data ||
      response.result ||
      response;

    if (response.items && base && !base.items) {
      return { ...base, items: response.items };
    }

    return base;
  };

  const normalizeReceiptItems = (receipt: any): any[] => {
    const items =
      receipt?.items ||
      receipt?.receipt_items ||
      receipt?.receiptItems ||
      receipt?.line_items ||
      receipt?.lineItems ||
      receipt?.products ||
      [];

    if (Array.isArray(items)) {
      return items;
    }

    if (items && Array.isArray(items.results)) {
      return items.results;
    }

    return [];
  };

  const setExtractedDataFromReceipt = (
    receipt: any,
    receiptItemsOverride?: any[],
    preserveExisting = false
  ) => {
    const receiptItems = receiptItemsOverride ?? normalizeReceiptItems(receipt);
    const normalizedVendor =
      getReceiptField(receipt, 'vendor_name', '') ||
      getReceiptField(receipt, 'vendor', '') ||
      getReceiptField(receipt, 'merchant_name', '') ||
      getReceiptField(receipt, 'merchant', '');
    const normalizedDate =
      getReceiptField(receipt, 'receipt_date', '') ||
      getReceiptField(receipt, 'date', '') ||
      getReceiptField(receipt, 'receiptDate', '') ||
      (receipt?.created_at ? String(receipt.created_at).split('T')[0] : '');
    const normalizedTotal =
      getReceiptField(receipt, 'total_amount', '') ||
      getReceiptField(receipt, 'total', '') ||
      getReceiptField(receipt, 'grand_total', '') ||
      getReceiptField(receipt, 'grandTotal', '') ||
      getReceiptField(receipt, 'amount', '') ||
      '0.00';
    const normalizedTax =
      getReceiptField(receipt, 'tax_amount', '') ||
      getReceiptField(receipt, 'tax', '') ||
      getReceiptField(receipt, 'vat', '') ||
      getReceiptField(receipt, 'taxAmount', '') ||
      '0.00';

    setExtractedData(prev => ({
      vendor_name: normalizedVendor || (preserveExisting ? prev.vendor_name : ''),
      receipt_date: normalizedDate || (preserveExisting ? prev.receipt_date : new Date().toISOString().split('T')[0]),
      total_amount: normalizedTotal || (preserveExisting ? prev.total_amount : '0.00'),
      tax_amount: normalizedTax || (preserveExisting ? prev.tax_amount : '0.00'),
      items: receiptItems && receiptItems.length > 0
        ? receiptItems.map((item: any) => ({
            id: item.id,
            item_name: item.item_name || item.name || '',
            description: item.notes || item.description || item.product_code || '',
            quantity: parseFloat(item.quantity || item.qty || 0),
            unit_price: parseFloat(item.unit_price || item.price || 0),
            total_price: parseFloat(item.total_price || item.total || 0),
            category: item.category,
            product_code: item.product_code,
          }))
        : (preserveExisting ? prev.items : []),
    }));

    return {
      normalizedVendor,
      normalizedDate,
      normalizedTotal,
      normalizedTax,
      itemsCount: receiptItems?.length || 0,
    };
  };

  // Load receipt data if receiptId is provided
  useEffect(() => {
    if (parsedReceiptData) {
      setExtractedDataFromReceipt(parsedReceiptData, undefined, true);
      setIsLoading(false);
    }
    if (receiptId) {
      loadReceipt();
    }
  }, [receiptId, receiptDataParam]);

  const getReceiptField = (receipt: any, key: string, fallback = ''): string => {
    if (!receipt) return fallback;
    return (
      receipt[key] ??
      receipt[`${key}`.replace('_', '')] ??
      receipt[key.replace('_', '')] ??
      fallback
    );
  };

  const fetchReceiptItems = async (id: number): Promise<any[]> => {
    const paramOptions = [
      { receipt: id },
      { receipt_id: id },
      { receiptId: id },
      { receipt__id: id },
    ];

    for (const params of paramOptions) {
      try {
        const response = await ReceiptItemsService.getReceiptItems(params as any);
        if (response?.results?.length) {
          return response.results;
        }
      } catch (error: any) {
        // Try next param
      }
    }

    return [];
  };

  const loadReceipt = async () => {
    try {
      setIsLoading(true);
      const receiptResponse = await ReceiptsService.getReceiptById(receiptId!);
      let receipt = normalizeReceiptResponse(receiptResponse);
      
      // If receipt doesn't have items or extraction not done, trigger OCR
      if (!normalizeReceiptItems(receipt).length || !receipt.is_extracted) {
        try {
          setIsExtracting(true);
          const extractResponse = await ReceiptsService.extractReceipt(receiptId!);
          if (extractResponse?.receipt) {
            receipt = normalizeReceiptResponse(extractResponse);
          } else if ((extractResponse as any)?.items) {
            receipt = {
              ...receipt,
              items: (extractResponse as any).items,
              total_amount: (extractResponse as any).total_amount || receipt.total_amount,
              tax_amount: (extractResponse as any).tax_amount || receipt.tax_amount,
              receipt_date: (extractResponse as any).receipt_date || receipt.receipt_date,
              vendor_name: (extractResponse as any).vendor_name || receipt.vendor_name,
            };
          } else {
            // If extraction is async, poll for updated receipt
            for (let attempt = 0; attempt < 5; attempt += 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              receipt = await ReceiptsService.getReceiptById(receiptId!);
              if (normalizeReceiptItems(receipt).length || receipt.is_extracted) {
                break;
              }
            }
          }
        } catch (extractError: any) {
          console.warn('OCR extraction failed:', extractError);
          // Continue with existing receipt data
        } finally {
          setIsExtracting(false);
        }
      }

      let receiptItems = normalizeReceiptItems(receipt);
      if (!receiptItems.length) {
        receiptItems = await fetchReceiptItems(receiptId!);
      }
      
      const { normalizedVendor, normalizedDate, normalizedTotal, normalizedTax, itemsCount } =
        setExtractedDataFromReceipt(receipt, receiptItems, true);

      console.log('Receipt debug:', {
        receiptId,
        receiptKeys: receipt ? Object.keys(receipt) : [],
        receiptResponseKeys: receiptResponse ? Object.keys(receiptResponse as any) : [],
        vendor: normalizedVendor,
        date: normalizedDate,
        total: normalizedTotal,
        tax: normalizedTax,
        itemsCount,
      });
    } catch (error: any) {
      console.error('Error loading receipt:', error);
      Alert.alert('Error', error.message || 'Failed to load receipt data.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof ExtractedItem, value: string | number) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => {
        if (idx !== index) return item;
        
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total_price if quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }),
    }));
  };

  const addItem = () => {
    const newItem: ExtractedItem = {
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setExtractedData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const deleteItem = (index: number) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const calculateTotal = () => {
    return extractedData.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const normalizeAmount = (value: string | number): string => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    }
    if (!value) return '0.00';
    const cleaned = value.toString().replace(/[^0-9.\-]/g, '');
    const parsed = parseFloat(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed.toFixed(2);
    }
    return '0.00';
  };

  const resolveDefaultCategoryId = async (items: ExtractedItem[]): Promise<number | undefined> => {
    const fromItems = items.find(item => item.category)?.category;
    if (fromItems) return fromItems;
    if (expenseCategories.length) return expenseCategories[0].id;

    try {
      await refreshCategories();
    } catch (error) {
      console.warn('Failed to refresh categories:', error);
    }

    if (expenseCategories.length) return expenseCategories[0].id;

    try {
      const response = await CategoriesService.getCategories({ type: 'expense' });
      const list = Array.isArray(response) ? response : response.results || [];
      return list[0]?.id;
    } catch (error) {
      console.warn('Failed to fetch expense categories:', error);
    }

    return undefined;
  };

  const buildReceiptFormData = async (
    normalizedDate: string,
    normalizedAmount: string
  ): Promise<FormData> => {
    if (!imageUri) {
      throw new Error('Receipt image is missing. Please rescan and try again.');
    }

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageName = 'receipt.jpg';
      const imageType = blob.type || 'image/jpeg';
      const imageFile = new File([blob], imageName, { type: imageType });
      formData.append('image', imageFile);
    } else {
      const imageUriParts = imageUri.split('/');
      const imageName = imageUriParts[imageUriParts.length - 1] || 'receipt.jpg';
      let imageType = 'image/jpeg';
      const lowerName = imageName.toLowerCase();
      if (lowerName.endsWith('.png')) {
        imageType = 'image/png';
      } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        imageType = 'image/jpeg';
      }
      formData.append('image', {
        uri: imageUri,
        type: imageType,
        name: imageName,
      } as any);
    }

    if (extractedData.vendor_name) {
      formData.append('vendor_name', extractedData.vendor_name);
    }
    formData.append('receipt_date', normalizedDate);
    formData.append('total_amount', normalizedAmount);
    if (extractedData.tax_amount) {
      formData.append('tax_amount', normalizeAmount(extractedData.tax_amount));
    }

    return formData;
  };

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out. Please try again.`));
      }, ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const handleSave = async () => {
    if (!receiptId) {
      const message = 'Receipt ID is missing.';
      setSaveError(message);
      setSaveStatus(null);
      Alert.alert('Error', message);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveStatus('Saving receipt...');
    try {
      let activeReceiptId = receiptId;
      let createdNewReceipt = false;
      const normalizedAmount =
        normalizeAmount(extractedData.total_amount) ||
        normalizeAmount(calculateTotal());
      const normalizedDate = formatDateForAPI(extractedData.receipt_date);
      const normalizedItems = extractedData.items
        .filter(item => item.item_name?.trim())
        .map(item => ({
          id: item.id,
          item_name: item.item_name.trim(),
          description: item.description?.trim() || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          category: item.category,
          product_code: item.product_code,
        }));

      console.log('Saving receipt and transaction...', {
        receiptId,
        amount: normalizedAmount,
        date: normalizedDate,
        items: normalizedItems.length,
      });

      // Update existing receipt (do not create a new one)
      try {
        await withTimeout(
          updateReceipt(receiptId, {
            vendor_name: extractedData.vendor_name,
            receipt_date: normalizedDate,
            total_amount: normalizedAmount,
            tax_amount: normalizeAmount(extractedData.tax_amount),
          }),
          20000,
          'Saving receipt'
        );
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.message || '';
        const isNotFound =
          status === 404 || message.toLowerCase().includes('no receipt matches');

        if (!isNotFound) {
          throw error;
        }

        setSaveStatus('Receipt not found. Creating a new receipt...');
        const formData = await buildReceiptFormData(normalizedDate, normalizedAmount);
        const createdReceipt = await withTimeout(
          ReceiptsService.uploadReceipt(formData),
          30000,
          'Creating receipt'
        );
        activeReceiptId = createdReceipt.receipt?.id || (createdReceipt as any)?.id;
        if (!activeReceiptId) {
          throw new Error('Failed to create receipt. Please try again.');
        }
        createdNewReceipt = true;
      }

      // Sync receipt items (create/update/delete)
      setSaveStatus('Saving receipt items...');
      const itemsForSave = createdNewReceipt
        ? normalizedItems.map(item => ({ ...item, id: undefined }))
        : normalizedItems;
      const existingItems = createdNewReceipt ? [] : await fetchReceiptItems(activeReceiptId);
      const currentIds = new Set(
        itemsForSave.filter(item => item.id).map(item => item.id)
      );

      const itemsToDelete = existingItems
        .filter(item => !currentIds.has(item.id))
        .map(item => item.id);

      const updatePromises = itemsForSave
        .filter(item => item.id)
        .map(item =>
          ReceiptItemsService.updateReceiptItem(item.id!, {
            item_name: item.item_name,
            quantity: item.quantity.toString(),
            unit_price: normalizeAmount(item.unit_price),
            total_price: normalizeAmount(item.total_price),
            category: item.category,
            product_code: item.product_code,
            notes: item.description,
          })
        );

      const createPromises = itemsForSave
        .filter(item => !item.id)
        .map(item =>
          ReceiptItemsService.createReceiptItem({
            receipt: activeReceiptId,
            item_name: item.item_name,
            quantity: item.quantity.toString(),
            unit_price: normalizeAmount(item.unit_price),
            total_price: normalizeAmount(item.total_price),
            category: item.category,
            product_code: item.product_code,
            notes: item.description,
          })
        );

      const deletePromises = itemsToDelete.map(id =>
        ReceiptItemsService.deleteReceiptItem(id)
      );

      await withTimeout(
        Promise.all([...updatePromises, ...createPromises, ...deletePromises]),
        20000,
        'Saving receipt items'
      );

      // Finalize receipt after all edits are saved
      setSaveStatus('Finalizing receipt...');
      await withTimeout(
        ReceiptsService.finalizeReceipt(activeReceiptId, {
          vendor_name: extractedData.vendor_name,
          receipt_date: normalizedDate,
          total_amount: normalizedAmount,
          tax_amount: normalizeAmount(extractedData.tax_amount),
        }),
        20000,
        'Finalizing receipt'
      );

      // Create transaction from receipt
      // Note: You may want to get the merchant ID from the merchant name
      // For now, we'll create without merchant
      const defaultCategoryId = await resolveDefaultCategoryId(itemsForSave);
      if (defaultCategoryId) {
        setSaveStatus('Saving transaction...');
        await withTimeout(
          createTransaction({
            type: 'expense',
            amount: normalizedAmount,
            date: normalizedDate,
            category: defaultCategoryId,
            description: `Receipt from ${extractedData.vendor_name}`,
          }),
          20000,
          'Saving transaction'
        );
        await refreshTransactions();
      }

      const successMessage = defaultCategoryId
        ? 'Receipt and transaction saved successfully!'
        : 'Receipt saved successfully. No expense category found, so a transaction was not created.';
      
      // Redirect to transactions page
      // For web platform, redirect immediately
      if (Platform.OS === 'web') {
        setSaveStatus('Success! Redirecting...');
        // Small delay to show success message, then redirect
        setTimeout(() => {
          router.replace('/transactions');
        }, 800);
      } else {
        // For mobile platforms, show alert with redirect
        Alert.alert('Success', successMessage, [
          { 
            text: 'OK', 
            onPress: () => {
              router.replace('/transactions');
            }
          }
        ]);
      }
      setSaveStatus(null);
    } catch (error: any) {
      console.error('Error saving receipt:', error);
      const details = error?.response?.data ? JSON.stringify(error.response.data) : '';
      const message = error.message || details || 'Failed to save receipt. Please try again.';
      setSaveError(message);
      setSaveStatus(null);
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtractNow = async () => {
    if (!receiptId) return;
    try {
      setIsExtracting(true);
      const extractResponse = await ReceiptsService.extractReceipt(receiptId);
      const normalizedExtract = normalizeReceiptResponse(extractResponse);
      if (normalizedExtract) {
        const extractItems = normalizeReceiptItems(normalizedExtract);
        if (extractItems.length) {
          setExtractedData(prev => ({
            ...prev,
            vendor_name: getReceiptField(normalizedExtract, 'vendor_name', prev.vendor_name),
            receipt_date: getReceiptField(normalizedExtract, 'receipt_date', prev.receipt_date),
            total_amount: getReceiptField(normalizedExtract, 'total_amount', prev.total_amount),
            tax_amount: getReceiptField(normalizedExtract, 'tax_amount', prev.tax_amount),
            items: extractItems.map((item: any) => ({
              id: item.id,
              item_name: item.item_name || item.name || '',
              description: item.notes || item.description || item.product_code || '',
              quantity: parseFloat(item.quantity || item.qty || 0),
              unit_price: parseFloat(item.unit_price || item.price || 0),
              total_price: parseFloat(item.total_price || item.total || 0),
              category: item.category,
              product_code: item.product_code,
            })),
          }));
          return;
        }
      }
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const receiptResponse = await ReceiptsService.getReceiptById(receiptId);
        const receipt = normalizeReceiptResponse(receiptResponse);
        let receiptItems = normalizeReceiptItems(receipt);
        if (!receiptItems.length) {
          receiptItems = await fetchReceiptItems(receiptId);
        }
        if (receiptItems.length) {
          setExtractedData(prev => ({
            ...prev,
            items: receiptItems.map((item: any) => ({
              id: item.id,
              item_name: item.item_name || item.name || '',
              description: item.notes || item.description || item.product_code || '',
              quantity: parseFloat(item.quantity || item.qty || 0),
              unit_price: parseFloat(item.unit_price || item.price || 0),
              total_price: parseFloat(item.total_price || item.total || 0),
              category: item.category,
              product_code: item.product_code,
            })),
          }));
          break;
        }
      }
    } catch (error: any) {
      Alert.alert('Extraction Failed', error.message || 'Could not extract receipt data.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Review Receipt</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Edit extracted information before saving
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading receipt data...</ThemedText>
        </View>
      ) : (
        <>
          {/* Receipt Image */}
          {imageUri && (
            <>
              <Card variant="elevated" style={styles.imageCard}>
                <Image source={{ uri: imageUri }} style={styles.image} />
              </Card>
              <View style={styles.extractRow}>
                <TouchableOpacity
                  style={styles.extractButton}
                  onPress={handleExtractNow}
                  disabled={isExtracting}
                >
                  <MaterialIcons name="auto-fix-high" size={16} color={Colors.text.inverse} />
                  <Text style={styles.extractButtonTextInverse}>
                    {isExtracting ? 'Extracting...' : 'Extract Data from Image'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Receipt Information */}
          <Card variant="elevated" style={styles.infoCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Receipt Information</ThemedText>
            <View style={styles.infoRow}>
              <Input
                label="Vendor Name"
                value={extractedData.vendor_name}
                onChangeText={(value) => setExtractedData(prev => ({ ...prev, vendor_name: value }))}
                containerStyle={[styles.infoColumn, isWide && styles.infoColumnWide]}
              />
              <Input
                label="Receipt Date"
                value={extractedData.receipt_date}
                onChangeText={(value) => setExtractedData(prev => ({ ...prev, receipt_date: value }))}
                rightIcon={<MaterialIcons name="calendar-today" size={18} color={Colors.primary[500]} />}
                containerStyle={[styles.infoColumn, isWide && styles.infoColumnWide]}
              />
              <Input
                label="Total Amount"
                value={extractedData.total_amount}
                onChangeText={(value) => setExtractedData(prev => ({ ...prev, total_amount: value }))}
                leftIcon={<Text style={styles.currencyPrefix}>£</Text>}
                keyboardType="decimal-pad"
                containerStyle={[styles.infoColumn, isWide && styles.infoColumnWide]}
              />
            </View>
            <Input
              label="Tax Amount (Optional)"
              value={extractedData.tax_amount}
              onChangeText={(value) => setExtractedData(prev => ({ ...prev, tax_amount: value }))}
              leftIcon={<Text style={styles.currencyPrefix}>£</Text>}
              keyboardType="decimal-pad"
              containerStyle={styles.infoFullRow}
            />
          </Card>

          {isExtracting && (
            <View style={styles.extractingBanner}>
              <ActivityIndicator size="small" color={Colors.primary[600]} />
              <ThemedText style={styles.extractingText}>
                Extracting data from image...
              </ThemedText>
            </View>
          )}
          {isSaving && saveStatus ? (
            <View style={styles.savingBanner}>
              <ActivityIndicator size="small" color={Colors.primary[600]} />
              <ThemedText style={styles.savingText}>{saveStatus}</ThemedText>
            </View>
          ) : null}
          {saveError ? (
            <View style={styles.saveErrorBanner}>
              <ThemedText style={styles.saveErrorText}>
                {saveError}
              </ThemedText>
            </View>
          ) : null}

          {/* Items List */}
          <Card variant="elevated" style={styles.itemsCard}>
            <View style={styles.itemsHeader}>
              <View style={styles.itemsTitleContainer}>
                <MaterialIcons name="list" size={20} color={Colors.primary[600]} />
                <ThemedText type="subtitle" style={styles.itemsTitle}>
                  Receipt Items
                </ThemedText>
              </View>
            </View>

            {isWide ? (
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.colItemNameFlex]}>Item Name</Text>
                  <Text style={[styles.tableHeaderCell, styles.colDescriptionFlex]}>Description</Text>
                  <Text style={[styles.tableHeaderCell, styles.colQuantityFlex]}>Quantity</Text>
                  <Text style={[styles.tableHeaderCell, styles.colUnitPriceFlex]}>Unit Price</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTotalPriceFlex]}>Total Price</Text>
                </View>

                {extractedData.items.map((item, index) => (
                  <View key={item.id || `item-${index}`} style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.colItemNameFlex]}>
                      <TextInput
                        style={styles.tableInput}
                        value={item.item_name}
                        onChangeText={(value) => updateItem(index, 'item_name', value)}
                        placeholder="Item name"
                      />
                    </View>
                    <View style={[styles.tableCell, styles.colDescriptionFlex]}>
                      <TextInput
                        style={styles.tableInput}
                        value={item.description || ''}
                        onChangeText={(value) => updateItem(index, 'description', value)}
                        placeholder="Description"
                      />
                    </View>
                    <View style={[styles.tableCell, styles.colQuantityFlex]}>
                      <TextInput
                        style={styles.tableInput}
                        value={item.quantity.toString()}
                        onChangeText={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={[styles.tableCell, styles.colUnitPriceFlex]}>
                      <TextInput
                        style={styles.tableInput}
                        value={item.unit_price.toFixed(2)}
                        onChangeText={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={[styles.tableCell, styles.colTotalPriceFlex]}>
                      <TextInput
                        style={[styles.tableInput, styles.tableInputDisabled]}
                        value={item.total_price.toFixed(2)}
                        editable={false}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.rowDeleteButton}
                      onPress={() => deleteItem(index)}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={Colors.error.main} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, styles.colItemName]}>Item Name</Text>
                    <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
                    <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Quantity</Text>
                    <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTotalPrice]}>Total Price</Text>
                  </View>

                  {extractedData.items.map((item, index) => (
                    <View key={item.id || `item-${index}`} style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.colItemName]}>
                        <TextInput
                          style={styles.tableInput}
                          value={item.item_name}
                          onChangeText={(value) => updateItem(index, 'item_name', value)}
                          placeholder="Item name"
                        />
                      </View>
                      <View style={[styles.tableCell, styles.colDescription]}>
                        <TextInput
                          style={styles.tableInput}
                          value={item.description || ''}
                          onChangeText={(value) => updateItem(index, 'description', value)}
                          placeholder="Description"
                        />
                      </View>
                      <View style={[styles.tableCell, styles.colQuantity]}>
                        <TextInput
                          style={styles.tableInput}
                          value={item.quantity.toString()}
                          onChangeText={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={[styles.tableCell, styles.colUnitPrice]}>
                        <TextInput
                          style={styles.tableInput}
                          value={item.unit_price.toFixed(2)}
                          onChangeText={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={[styles.tableCell, styles.colTotalPrice]}>
                        <TextInput
                          style={[styles.tableInput, styles.tableInputDisabled]}
                          value={item.total_price.toFixed(2)}
                          editable={false}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.rowDeleteButton}
                        onPress={() => deleteItem(index)}
                      >
                        <MaterialIcons name="delete-outline" size={18} color={Colors.error.main} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.addItemRowButton} onPress={addItem}>
              <MaterialIcons name="add" size={18} color={Colors.primary[600]} />
              <Text style={styles.addItemRowText}>Add Another Item</Text>
            </TouchableOpacity>

            {/* Grand Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Grand Total (from items)</Text>
              <Text style={styles.totalValue}>£{calculateTotal().toFixed(2)}</Text>
            </View>
          </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton, isSaving && styles.buttonDisabled]}
          onPress={() => router.back()}
          onClick={Platform.OS === 'web' ? () => router.back() : undefined}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          onClick={Platform.OS === 'web' ? handleSave : undefined}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Transaction'}
          </Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  imageCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: Colors.gray[100],
  },
  extractRow: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  infoColumn: {
    flexGrow: 1,
    flexBasis: 260,
    minWidth: 240,
  },
  infoColumnWide: {
    flexBasis: 0,
    flexGrow: 1,
  },
  infoFullRow: {
    marginTop: Spacing.xs,
  },
  currencyPrefix: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  itemsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.primary[600],
  },
  extractButtonTextInverse: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tableHeaderCell: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  tableCell: {
    paddingHorizontal: Spacing.xs,
  },
  tableInput: {
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  tableInputDisabled: {
    backgroundColor: Colors.gray[100],
    color: Colors.text.secondary,
  },
  colItemName: {
    width: 180,
  },
  colDescription: {
    width: 160,
  },
  colQuantity: {
    width: 100,
  },
  colUnitPrice: {
    width: 120,
  },
  colTotalPrice: {
    width: 120,
  },
  colItemNameFlex: {
    flex: 2,
    minWidth: 180,
  },
  colDescriptionFlex: {
    flex: 2,
    minWidth: 160,
  },
  colQuantityFlex: {
    flex: 1,
    minWidth: 100,
  },
  colUnitPriceFlex: {
    flex: 1,
    minWidth: 120,
  },
  colTotalPriceFlex: {
    flex: 1,
    minWidth: 120,
  },
  rowDeleteButton: {
    padding: Spacing.xs,
  },
  addItemRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addItemRowText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  saveErrorText: {
    color: Colors.error.main,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  saveErrorBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.error.light,
    borderWidth: 1,
    borderColor: Colors.error.main,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    backgroundColor: Colors.background.light,
  },
  cancelButtonText: {
    color: Colors.primary[600],
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  saveButton: {
    flex: 2,
    backgroundColor: Colors.primary[500],
  },
  saveButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  extractingBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  savingBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  savingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.semibold,
  },
  extractingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.semibold,
  },
});
