import { utils, writeFile } from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  writeFile(workbook, `${fileName}.xlsx`);
};

export const formatGSTReportForExcel = (data: any) => {
  const b2bData = data.b2b.map((item: any) => ({
    'Invoice Number': item.invoiceNumber,
    'Date': item.date,
    'Customer Name': item.customerName,
    'GSTIN': item.gstin,
    'State Code': item.stateCode,
    'Taxable Value': item.taxableValue,
    'CGST': item.cgst,
    'SGST': item.sgst,
    'IGST': item.igst,
    'Total': item.total
  }));

  const b2clData = data.b2cl.map((item: any) => ({
    'Invoice Number': item.invoiceNumber,
    'Date': item.date,
    'State Code': item.stateCode,
    'Taxable Value': item.taxableValue,
    'IGST': item.igst,
    'Total': item.total
  }));

  const b2csData = data.b2cs.map((item: any) => ({
    'State Code': item.stateCode,
    'GST Rate': item.gstRate,
    'Taxable Value': item.taxableValue,
    'CGST': item.cgst,
    'SGST': item.sgst,
    'IGST': item.igst,
    'Total': item.total
  }));

  const hsnData = data.hsn.map((item: any) => ({
    'HSN Code': item.hsnCode,
    'Description': item.description,
    'Quantity': item.quantity,
    'Unit': item.unit,
    'Taxable Value': item.taxableValue,
    'GST Rate': item.gstRate,
    'CGST': item.cgst,
    'SGST': item.sgst,
    'IGST': item.igst,
    'Total': item.total
  }));

  return {
    b2bData,
    b2clData,
    b2csData,
    hsnData
  };
};

export const formatReportsForExcel = (data: any) => {
  const salesData = {
    summary: [{
      'Total Sales': data.totals.sales,
      'Total Purchases': data.totals.purchases,
      'Total Invoices': data.counts.invoices,
      'Total Purchase Orders': data.counts.purchases
    }],
    topProducts: data.topProducts.map((product: any) => ({
      'Product Name': product.name,
      'Category': product.category,
      'Quantity Sold': product.quantity,
      'Revenue': product.revenue,
      'Profit': product.profit
    })),
    categoryPerformance: data.categoryPerformance.map((category: any) => ({
      'Category': category.name,
      'Sales': category.sales,
      'Percentage': ((category.sales / data.totals.sales) * 100).toFixed(2) + '%'
    })),
    paymentMethods: data.paymentMethods.map((method: any) => ({
      'Payment Method': method.method,
      'Amount': method.amount,
      'Transaction Count': method.count
    }))
  };

  return salesData;
};