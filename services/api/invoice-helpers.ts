/**
 * Invoice Helper Functions
 * Utility functions for invoice-related operations including transaction creation
 */

import { InvoicesService, InvoiceItemsService, TransactionsService } from './index';
import { Invoice, InvoiceItem, InvoiceItemRequest } from './types';

/**
 * Finalize invoice and create transaction
 * This function finalizes an invoice and creates a corresponding transaction
 * 
 * @param invoiceId - The invoice ID to finalize
 * @param invoiceData - Optional invoice data to update during finalization
 * @param transactionData - Transaction data (amount, date, category, description)
 * @returns Promise with invoice and transaction data
 */
export async function finalizeInvoiceAndCreateTransaction(
  invoiceId: number,
  invoiceData?: Partial<{
    vendor_name: string;
    invoice_date: string;
    total_amount: string;
    tax_amount: string;
  }>,
  transactionData?: {
    amount: string;
    date: string;
    category: number;
    description?: string;
  }
): Promise<{ invoice: Invoice; transaction?: any }> {
  // Finalize the invoice
  const invoice = await InvoicesService.finalizeInvoice(invoiceId, invoiceData);

  // If transaction data is provided, create transaction
  if (transactionData) {
    const transaction = await TransactionsService.createTransaction({
      type: 'expense',
      amount: transactionData.amount,
      date: transactionData.date,
      category: transactionData.category,
      description: transactionData.description || `Invoice from ${invoice.vendor_name || 'Unknown'}`,
    });

    return { invoice, transaction };
  }

  return { invoice };
}

/**
 * Get invoice total from invoice items
 * Calculates the total amount from all invoice items
 * 
 * @param invoiceId - The invoice ID
 * @returns Promise with total amount as string
 */
export async function getInvoiceTotal(invoiceId: number): Promise<string> {
  const response = await InvoiceItemsService.getInvoiceItems({ invoice: invoiceId });
  const items = 'results' in response ? response.results : [];
  
  const total = items.reduce((sum: number, item: InvoiceItem) => {
    return sum + parseFloat(item.amount || '0');
  }, 0);

  return total.toFixed(2);
}

/**
 * Create invoice item and optionally finalize invoice + create transaction
 * 
 * @param itemData - Invoice item data
 * @param options - Options for finalization and transaction creation
 * @returns Promise with created item and optionally invoice/transaction
 */
export async function createInvoiceItemWithTransaction(
  itemData: InvoiceItemRequest,
  options?: {
    finalizeInvoice?: boolean;
    createTransaction?: boolean;
    invoiceData?: Partial<{
      vendor_name: string;
      invoice_date: string;
      total_amount: string;
      tax_amount: string;
    }>;
    transactionData?: {
      date: string;
      category: number;
      description?: string;
    };
  }
): Promise<{
  item: InvoiceItem;
  invoice?: Invoice;
  transaction?: any;
}> {
  // Create the invoice item
  const item = await InvoiceItemsService.createInvoiceItem(itemData);

  // If finalization is requested
  if (options?.finalizeInvoice && itemData.invoice) {
    const invoiceTotal = await getInvoiceTotal(itemData.invoice);
    
    const invoiceData = options.invoiceData || {
      total_amount: invoiceTotal,
    };

    // Finalize invoice
    const invoice = await InvoicesService.finalizeInvoice(
      itemData.invoice,
      invoiceData
    );

    // If transaction creation is requested
    if (options?.createTransaction && options.transactionData) {
      const transaction = await TransactionsService.createTransaction({
        type: 'expense',
        amount: invoiceTotal,
        date: options.transactionData.date,
        category: options.transactionData.category,
        description: options.transactionData.description || `Invoice from ${invoice.vendor_name || 'Unknown'}`,
      });

      return { item, invoice, transaction };
    }

    return { item, invoice };
  }

  return { item };
}
