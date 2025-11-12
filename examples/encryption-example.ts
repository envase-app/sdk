/**
 * Encryption Example - Envase SDK
 *
 * This example demonstrates:
 * 1. Generating encryption keys
 * 2. Using encryption with secrets
 * 3. Transparent encryption/decryption
 */

import 'dotenv/config';
import { EnvaseClient, EncryptionService } from '../src/index';
import { AuthorizationError } from '../src/index';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Load environment variables required for the encryption example
 * @returns Configuration object with API settings and optional encryption key
 */
function loadConfig() {
  const apiUrl = process.env.ENVASE_API_URL;
  const token = process.env.ENVASE_TOKEN;
  const organization = process.env.ENVASE_ORGANIZATION;
  const encryptionKey = process.env.ENVASE_ENCRYPTION_KEY;
  const projectId = process.env.ENVASE_PROJECT_ID;
  const environmentId = process.env.ENVASE_ENVIRONMENT_ID;

  if (!apiUrl || !token) {
    throw new Error(
      'Missing required environment variables: ENVASE_API_URL and ENVASE_TOKEN'
    );
  }

  return {
    apiUrl,
    token,
    organization,
    encryptionKey,
    projectId,
    environmentId,
  };
}

// ============================================================================
// Main Example
// ============================================================================

async function main() {
  try {
    const config = loadConfig();
    console.log('🔧 Configuration loaded\n');

    // ------------------------------------------------------------------------
    // Example 1: Generate an encryption key
    // ------------------------------------------------------------------------
    console.log('🔑 Generating encryption key...');
    const generatedKey = await EncryptionService.generateKey();
    console.log(`   Generated key: ${generatedKey.substring(0, 16)}...`);
    console.log(
      '   ⚠️  Save this key securely! You\'ll need it to decrypt your secrets.\n'
    );

    // Use provided key or generated key
    const encryptionKey = config.encryptionKey || generatedKey;
    if (config.encryptionKey) {
      console.log('✅ Using encryption key from environment\n');
    } else {
      console.log('⚠️  Using generated key (not persisted)\n');
    }

    // ------------------------------------------------------------------------
    // Example 2: Initialize client with encryption
    // ------------------------------------------------------------------------
    console.log('🔐 Initializing client with encryption...');
    const client = new EnvaseClient({
      apiUrl: config.apiUrl,
      token: config.token,
      organization: config.organization || '',
      enableEncryption: true,
      encryptionKey,
    });
    console.log('✅ Client initialized with encryption enabled\n');

    // ------------------------------------------------------------------------
    // Example 3: Encrypt/decrypt data directly
    // ------------------------------------------------------------------------
    console.log('🔒 Testing encryption directly...');
    const crypto = new EncryptionService(encryptionKey);
    const plaintext = 'my-super-secret-value';
    const encrypted = await crypto.encrypt(plaintext);
    const decrypted = await crypto.decrypt(encrypted);

    console.log(`   Plaintext: ${plaintext}`);
    console.log(`   Encrypted: ${encrypted.substring(0, 32)}...`);
    console.log(`   Decrypted: ${decrypted}`);
    console.log(`   Match: ${plaintext === decrypted ? '✅ Yes' : '❌ No'}\n`);

    // ------------------------------------------------------------------------
    // Example 4: Create a secret with encryption
    // (requires project/environment IDs in environment variables)
    // ------------------------------------------------------------------------
    if (config.projectId && config.environmentId) {
      console.log('💾 Creating encrypted secret...');
      try {
        const testSecretKey = `TEST_SECRET_${Date.now()}`;
        const testSecretValue = 'This is a test secret value';

        const secret = await client.secrets.set({
          projectId: config.projectId,
          environmentId: config.environmentId,
          key: testSecretKey,
          value: testSecretValue,
          description: 'Test secret created by encryption example',
        });

        console.log(`   ✅ Secret created: ${secret.key}`);
        console.log(`   Scope: ${secret.scope}`);
        console.log('   Value is encrypted in transit and at rest\n');

        // ------------------------------------------------------------------------
        // Example 5: Retrieve and decrypt the secret
        // ------------------------------------------------------------------------
        console.log('🔓 Retrieving and decrypting secret...');
        const retrievedSecret = await client.secrets.get({
          projectId: config.projectId,
          environmentId: config.environmentId,
          key: testSecretKey,
        });

        console.log(`   ✅ Secret retrieved: ${retrievedSecret.key}`);
        console.log(
          `   Value (decrypted): ${retrievedSecret.value === testSecretValue ? '✅ Matches' : '❌ Mismatch'}`
        );
        console.log(
          '   Decryption is transparent - the SDK handles it automatically\n'
        );

        // ------------------------------------------------------------------------
        // Example 6: Clean up - delete the test secret
        // ------------------------------------------------------------------------
        console.log('🗑️  Cleaning up test secret...');
        try {
          await client.secrets.delete({
            projectId: config.projectId,
            environmentId: config.environmentId,
            key: testSecretKey,
          });
          console.log('   ✅ Test secret deleted\n');
        } catch (error) {
          if (error instanceof AuthorizationError) {
            console.log('   ⚠️  Cannot delete secret (insufficient permissions)');
            console.log('   You may need to delete it manually\n');
          } else {
            throw error;
          }
        }
      } catch (error) {
        if (error instanceof AuthorizationError) {
          console.error('   ⚠️  Access denied: You don\'t have permission to manage secrets');
          console.error('   The encryption still works, but you cannot test it with the API\n');
        } else {
          throw error;
        }
      }
    } else {
      console.log(
        '⚠️  Project ID and Environment ID not provided in environment variables'
      );
      console.log('   Skipping API operations with encryption\n');
    }

    // ============================================================================
    // Summary
    // ============================================================================
    console.log('✅ Encryption example completed successfully!');
    console.log('\n📝 Notes:');
    console.log('   - Encryption keys should be stored securely');
    console.log('   - Use the same key to encrypt and decrypt');
    console.log('   - Keys are 64 hex characters long');
    console.log('   - The SDK handles encryption/decryption transparently');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    process.exit(1);
  }
}

// ============================================================================
// Entry Point
// ============================================================================

// Run the example
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

