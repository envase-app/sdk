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
  constructor(message = 'Authentication failed', code?: string) {
    super(message, code, 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization errors
export class AuthorizationError extends EnvaseError {
  constructor(message = 'Access denied', code?: string) {
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
  constructor(message = 'Validation failed', public details: ValidationErrorDetail[] = []) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

// Network errors
export class NetworkError extends EnvaseError {
  constructor(message = 'Network error', statusCode = 0) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

// Encryption errors
export class EncryptionError extends EnvaseError {
  constructor(message = 'Encryption failed', code?: string) {
    super(message, code);
    this.name = 'EncryptionError';
  }
}

// Configuration errors
export class ConfigurationError extends EnvaseError {
  constructor(message = 'Configuration error', code?: string) {
    super(message, code);
    this.name = 'ConfigurationError';
  }
}
