export const calculateGst = (amount: number, rate: number, isInterState: boolean) => {
  const gstAmount = (amount * rate) / 100;
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount
    };
  }
  
  return {
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    igst: 0
  };
};

export const calculateInvoiceTotals = (items: Array<{
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
}>, isInterState: boolean) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  
  items.forEach(item => {
    const itemTotal = item.quantity * item.price;
    const itemDiscount = (itemTotal * item.discount) / 100;
    const taxableValue = itemTotal - itemDiscount;
    
    subtotal += itemTotal;
    totalDiscount += itemDiscount;
    totalTaxableValue += taxableValue;
    
    const { cgst, sgst, igst } = calculateGst(taxableValue, item.gstRate, isInterState);
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;
  });
  
  const grandTotal = totalTaxableValue + totalCgst + totalSgst + totalIgst;
  
  return {
    subtotal,
    totalDiscount,
    totalTaxableValue,
    totalCgst,
    totalSgst,
    totalIgst,
    grandTotal
  };
};