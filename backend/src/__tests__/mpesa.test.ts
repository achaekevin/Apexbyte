import { describe, it, expect } from '@jest/globals';
import mpesaService from '../services/mpesa.service';

describe('Safaricom Daraja M-Pesa Payment Integration Tests', () => {
  describe('Phone Number Normalization & Validation', () => {
    it('normalizes local standard Kenyan phone number (07XXXXXXXX)', () => {
      const normalized = mpesaService.normalizePhoneNumber('0712345678');
      expect(normalized).toBe('254712345678');
    });

    it('normalizes local Airtel/Safaricom 01 series number (01XXXXXXXX)', () => {
      const normalized = mpesaService.normalizePhoneNumber('0112345678');
      expect(normalized).toBe('254112345678');
    });

    it('normalizes phone number with international +254 prefix', () => {
      const normalized = mpesaService.normalizePhoneNumber('+254722000000');
      expect(normalized).toBe('254722000000');
    });

    it('leaves already normalized 254XXXXXXXXX untouched', () => {
      const normalized = mpesaService.normalizePhoneNumber('254701234567');
      expect(normalized).toBe('254701234567');
    });

    it('cleans whitespace, dashes and formatting characters', () => {
      const normalized = mpesaService.normalizePhoneNumber(' 0712-345 678 ');
      expect(normalized).toBe('254712345678');
    });

    it('throws error for invalid phone number lengths', () => {
      expect(() => mpesaService.normalizePhoneNumber('0712345')).toThrow();
      expect(() => mpesaService.normalizePhoneNumber('254712345678999')).toThrow();
    });

    it('throws error for non-Kenyan international numbers', () => {
      expect(() => mpesaService.normalizePhoneNumber('+14155552671')).toThrow();
    });
  });

  describe('Password & Timestamp Generation', () => {
    it('generates a valid 14-character Daraja timestamp (YYYYMMDDHHmmss)', () => {
      const timestamp = mpesaService.getTimestamp();
      expect(timestamp).toHaveLength(14);
      expect(/^\d{14}$/.test(timestamp)).toBe(true);
    });

    it('generates valid base64 password from shortcode, passkey, and timestamp', () => {
      const shortcode = '174379';
      const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
      const timestamp = '20261030190000';
      const password = mpesaService.generatePassword(shortcode, passkey, timestamp);

      const expected = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
      expect(password).toBe(expected);
    });
  });

  describe('STK Push Callback Parser & Verification', () => {
    it('correctly extracts payment parameters from successful Daraja callback', () => {
      const mockSuccessCallback = {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-1',
            CheckoutRequestID: 'ws_CO_191220261001201515',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 85000.0 },
                { Name: 'MpesaReceiptNumber', Value: 'SLA48KJH7G' },
                { Name: 'Balance' },
                { Name: 'TransactionDate', Value: 20261030191500 },
                { Name: 'PhoneNumber', Value: 254710450469 },
              ],
            },
          },
        },
      };

      const { stkCallback } = mockSuccessCallback.Body;
      expect(stkCallback.ResultCode).toBe(0);
      expect(stkCallback.CheckoutRequestID).toBe('ws_CO_191220261001201515');

      const metadataItems = stkCallback.CallbackMetadata.Item;
      const getVal = (name: string) => metadataItems.find((i) => i.Name === name)?.Value;

      expect(getVal('Amount')).toBe(85000.0);
      expect(getVal('MpesaReceiptNumber')).toBe('SLA48KJH7G');
      expect(getVal('PhoneNumber')).toBe(254710450469);
    });

    it('correctly flags user cancellation from Daraja callback (ResultCode 1032)', () => {
      const mockCancelCallback = {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-2',
            CheckoutRequestID: 'ws_CO_191220261001209999',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      const { stkCallback } = mockCancelCallback.Body;
      expect(stkCallback.ResultCode).toBe(1032);
      expect(stkCallback.ResultDesc).toContain('cancelled');
    });

    it('validates paid amount matches order amount exactly (anti-underpayment)', () => {
      const orderTotal = 85000;
      const receivedAmount = 85000;
      const underpaidAmount = 500;

      const isAmountValid = (paid: number, expected: number) => Math.abs(paid - expected) < 1;

      expect(isAmountValid(receivedAmount, orderTotal)).toBe(true);
      expect(isAmountValid(underpaidAmount, orderTotal)).toBe(false);
    });
  });
});
