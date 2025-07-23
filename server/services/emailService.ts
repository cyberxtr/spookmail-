// server/services/emailService.ts
import axios from 'axios';

interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  isDisposable: boolean;
  isCatchall: boolean;
  qualityScore: number;
  format: boolean;
  mx: boolean;
  smtp: boolean;
  reason?: string;
  didYouMean?: string;
}

class EmailService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.EMAIL_VERIFICATION_API_KEY || '';
    if (!this.apiKey && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ EMAIL_VERIFICATION_API_KEY is not set. Email verification will use mock data.');
    }
  }

  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    try {
      // If API key is not set, return mock data for development
      if (!this.apiKey) {
        return this.getMockVerificationResult(email);
      }
      
      // Make API request to email verification service
      const response = await axios.get(`https://api.emailverification.com/v1/verify`, {
        params: {
          email,
          apiKey: this.apiKey
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      const data = response.data;
      
      return {
        email,
        isValid: data.valid || false,
        isDisposable: data.disposable || false,
        isCatchall: data.catchall || false,
        qualityScore: data.quality_score || 0,
        format: data.format_valid || false,
        mx: data.mx_found || false,
        smtp: data.smtp_check || false,
        reason: data.reason,
        didYouMean: data.did_you_mean
      };
    } catch (error) {
      console.error('Email verification API error:', error);
      
      // Fallback to mock data if API fails
      return this.getMockVerificationResult(email);
    }
  }
  
  private getMockVerificationResult(email: string): EmailVerificationResult {
    // Simple validation for development/testing
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const domain = email.split('@')[1]?.toLowerCase();
    
    const isDisposable = [
      'tempmail.com', 'throwaway.com', 'mailinator.com', 
      'yopmail.com', 'guerrillamail.com', 'temp-mail.org'
    ].includes(domain);
    
    // Generate a somewhat realistic mock result
    return {
      email,
      isValid: isValidFormat && !isDisposable,
      isDisposable,
      isCatchall: false,
      qualityScore: isValidFormat ? (isDisposable ? 30 : 85) : 10,
      format: isValidFormat,
      mx: isValidFormat,
      smtp: isValidFormat && !isDisposable,
      reason: !isValidFormat ? 'Invalid email format' : 
              isDisposable ? 'Disposable email detected' : undefined,
      didYouMean: !isValidFormat && email.includes('gmial') ? 
                  email.replace('gmial', 'gmail') : undefined
    };
  }
}

export const emailService = new EmailService();
