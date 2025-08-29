import { Platform, PermissionsAndroid } from 'react-native';
import SmsRetriever from 'react-native-get-sms-android';

export interface SMSMessage {
  id: string;
  address: string;
  body: string;
  date: number;
  date_sent: number;
  read: boolean;
  type: number;
}

export class SMSService {
  static async requestSMSPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('SMS reading is only available on Android');
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to read SMS messages to calculate your Bharat Score.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting SMS permission:', err);
      return false;
    }
  }

  static async getSMSMessages(
    filter: {
      box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued';
      maxCount?: number;
      read?: boolean;
      body?: string;
      address?: string;
    } = {}
  ): Promise<SMSMessage[]> {
    if (Platform.OS !== 'android') {
      throw new Error('SMS reading is only available on Android');
    }

    try {
      const hasPermission = await this.requestSMSPermission();
      if (!hasPermission) {
        throw new Error('SMS permission not granted');
      }

      const messages = await SmsRetriever.list(
        filter.box || 'inbox',
        {
          maxCount: filter.maxCount || 100,
          read: filter.read,
          body: filter.body,
          address: filter.address,
        }
      );

      return messages.map((msg: any) => ({
        id: msg._id,
        address: msg.address,
        body: msg.body,
        date: msg.date,
        date_sent: msg.date_sent,
        read: msg.read === 1,
        type: msg.type,
      }));
    } catch (error) {
      console.error('Error reading SMS messages:', error);
      throw error;
    }
  }

  static async getSMSCount(): Promise<number> {
    try {
      const messages = await this.getSMSMessages({ maxCount: 1000 });
      return messages.length;
    } catch (error) {
      console.error('Error getting SMS count:', error);
      return 0;
    }
  }

  static async searchSMSByKeyword(keyword: string): Promise<SMSMessage[]> {
    try {
      const messages = await this.getSMSMessages({ body: keyword });
      return messages;
    } catch (error) {
      console.error('Error searching SMS by keyword:', error);
      return [];
    }
  }

  static async getRecentSMS(count: number = 50): Promise<SMSMessage[]> {
    try {
      const messages = await this.getSMSMessages({ maxCount: count });
      return messages.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Error getting recent SMS:', error);
      return [];
    }
  }
}

export default SMSService;
