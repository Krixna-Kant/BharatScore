import { Platform } from 'react-native';
import SMSService, { SMSMessage } from '../services/smsService';

// Mock react-native-get-sms-android
jest.mock('react-native-get-sms-android', () => ({
  list: jest.fn(),
}));

// Mock PermissionsAndroid
jest.mock('react-native', () => ({
  Platform,
  PermissionsAndroid: {
    request: jest.fn(),
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    PERMISSIONS: {
      READ_SMS: 'android.permission.READ_SMS',
    },
  },
}));

describe('SMSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestSMSPermission', () => {
    it('should return false for non-Android platforms', async () => {
      Platform.OS = 'ios';
      const result = await SMSService.requestSMSPermission();
      expect(result).toBe(false);
    });

    it('should request SMS permission on Android', async () => {
      Platform.OS = 'android';
      const mockRequest = require('react-native').PermissionsAndroid.request;
      mockRequest.mockResolvedValue('granted');

      const result = await SMSService.requestSMSPermission();
      
      expect(mockRequest).toHaveBeenCalledWith(
        'android.permission.READ_SMS',
        expect.objectContaining({
          title: 'SMS Permission',
          message: expect.stringContaining('Bharat Score'),
        })
      );
      expect(result).toBe(true);
    });

    it('should handle permission denial', async () => {
      Platform.OS = 'android';
      const mockRequest = require('react-native').PermissionsAndroid.request;
      mockRequest.mockResolvedValue('denied');

      const result = await SMSService.requestSMSPermission();
      expect(result).toBe(false);
    });
  });

  describe('getSMSMessages', () => {
    it('should throw error for non-Android platforms', async () => {
      Platform.OS = 'ios';
      
      await expect(SMSService.getSMSMessages()).rejects.toThrow(
        'SMS reading is only available on Android'
      );
    });

    it('should throw error when permission not granted', async () => {
      Platform.OS = 'android';
      jest.spyOn(SMSService, 'requestSMSPermission').mockResolvedValue(false);

      await expect(SMSService.getSMSMessages()).rejects.toThrow(
        'SMS permission not granted'
      );
    });

    it('should return SMS messages when permission granted', async () => {
      Platform.OS = 'android';
      jest.spyOn(SMSService, 'requestSMSPermission').mockResolvedValue(true);

      const mockSmsRetriever = require('react-native-get-sms-android');
      const mockMessages = [
        {
          _id: '1',
          address: '+1234567890',
          body: 'Test message 1',
          date: Date.now(),
          date_sent: Date.now(),
          read: 1,
          type: 1,
        },
        {
          _id: '2',
          address: '+0987654321',
          body: 'Test message 2',
          date: Date.now() - 1000,
          date_sent: Date.now() - 1000,
          read: 0,
          type: 1,
        },
      ];

      mockSmsRetriever.list.mockResolvedValue(mockMessages);

      const result = await SMSService.getSMSMessages({ maxCount: 50 });

      expect(mockSmsRetriever.list).toHaveBeenCalledWith('inbox', {
        maxCount: 50,
        read: undefined,
        body: undefined,
        address: undefined,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        address: '+1234567890',
        body: 'Test message 1',
        date: expect.any(Number),
        date_sent: expect.any(Number),
        read: true,
        type: 1,
      });
    });
  });

  describe('getSMSCount', () => {
    it('should return SMS count', async () => {
      jest.spyOn(SMSService, 'getSMSMessages').mockResolvedValue([
        {} as SMSMessage,
        {} as SMSMessage,
        {} as SMSMessage,
      ]);

      const count = await SMSService.getSMSCount();
      expect(count).toBe(3);
    });

    it('should return 0 on error', async () => {
      jest.spyOn(SMSService, 'getSMSMessages').mockRejectedValue(new Error('Test error'));

      const count = await SMSService.getSMSCount();
      expect(count).toBe(0);
    });
  });

  describe('searchSMSByKeyword', () => {
    it('should search SMS by keyword', async () => {
      const mockMessages = [
        { id: '1', body: 'Bank transaction successful' } as SMSMessage,
        { id: '2', body: 'Payment received' } as SMSMessage,
      ];

      jest.spyOn(SMSService, 'getSMSMessages').mockResolvedValue(mockMessages);

      const results = await SMSService.searchSMSByKeyword('bank');
      
      expect(SMSService.getSMSMessages).toHaveBeenCalledWith({
        body: 'bank',
      });
      expect(results).toEqual(mockMessages);
    });

    it('should return empty array on error', async () => {
      jest.spyOn(SMSService, 'getSMSMessages').mockRejectedValue(new Error('Test error'));

      const results = await SMSService.searchSMSByKeyword('test');
      expect(results).toEqual([]);
    });
  });

  describe('getRecentSMS', () => {
    it('should return recent SMS sorted by date', async () => {
      const mockMessages = [
        { id: '1', date: Date.now() - 2000 } as SMSMessage,
        { id: '2', date: Date.now() - 1000 } as SMSMessage,
        { id: '3', date: Date.now() } as SMSMessage,
      ];

      jest.spyOn(SMSService, 'getSMSMessages').mockResolvedValue(mockMessages);

      const results = await SMSService.getRecentSMS(50);

      expect(SMSService.getSMSMessages).toHaveBeenCalledWith({ maxCount: 50 });
      expect(results[0].id).toBe('3'); // Most recent first
      expect(results[2].id).toBe('1'); // Oldest last
    });
  });
});
