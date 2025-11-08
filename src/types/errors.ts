// Base error class
export class EnvaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'EnvaseError';
  }
}

// Authentication errors
export class AuthenticationError extends EnvaseError {
  constructor(message: string = 'Authentication failed', code?: string) {
    super(message, code, 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization errors
export class AuthorizationError extends EnvaseError {
  constructor(message: string = 'Access denied', code?: string) {
    super(message, code, 403);
    this.name = 'AuthorizationError';
  }
}

// Validation errors
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export class ValidationError extends EnvaseError {
  constructor(
    message: string = 'Validation failed',
    public details: ValidationErrorDetail[] = []
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

// Network errors
export class NetworkError extends EnvaseError {
  constructor(message: string = 'Network error', statusCode: number = 0) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

// Encryption errors
export class EncryptionError extends EnvaseError {
  constructor(message: string = 'Encryption failed', code?: string) {
    super(message, code);
    this.name = 'EncryptionError';
  }
}

// Configuration errors
export class ConfigurationError extends EnvaseError {
  constructor(message: string = 'Configuration error', code?: string) {
    super(message, code);
    this.name = 'ConfigurationError';
  }
}
