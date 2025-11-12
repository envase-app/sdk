/**
 * Basic Example - Envase SDK
 *
 * This example demonstrates basic usage of the Envase SDK:
 * - Initialize the client
 * - List projects
 * - List environments
 * - List and manage secrets
 * - Handle errors
 */

import 'dotenv/config';
import { EnvaseClient } from '../src/index';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
} from '../src/index';

// Load environment variables
function loadConfig() {
  const apiUrl = process.env.ENVASE_API_URL;
  const token = process.env.ENVASE_TOKEN;
  const organization = process.env.ENVASE_ORGANIZATION;

  if (!apiUrl || !token) {
    throw new Error(
      'Missing required environment variables: ENVASE_API_URL and ENVASE_TOKEN'
    );
  }

  return { apiUrl, token, organization };
}

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    console.log('🔧 Configuration loaded');
    console.log(`   API URL: ${config.apiUrl}`);
    console.log(`   Organization: ${config.organization || 'not set'}\n`);

    // Initialize the client
    const client = new EnvaseClient({
      apiUrl: config.apiUrl,
      token: config.token,
      organization: config.organization,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    });

    console.log('✅ Envase client initialized\n');

    // Example 1: List projects
    console.log('📦 Listing projects...');
    try {
      const projects = await client.projects.list({
        organization: config.organization,
      });
      console.log(`   Found ${projects.length} project(s)`);
      for (const project of projects.slice(0, 3)) {
        console.log(`   - ${project.name} (${project.id})`);
      }
      if (projects.length > 3) {
        console.log(`   ... and ${projects.length - 3} more`);
      }
    } catch (error) {
      console.error('   ❌ Failed to list projects:', error);
    }
    console.log();

    // Example 2: Get a specific project (if ID is provided)
    const projectId = process.env.ENVASE_PROJECT_ID;
    if (projectId) {
      console.log(`📋 Getting project: ${projectId}...`);
      try {
        const project = await client.projects.get(projectId);
        console.log(`   ✅ Project: ${project.name}`);
        console.log(`   Description: ${project.description || 'N/A'}`);
        console.log(`   Slug: ${project.slug}`);
      } catch (error) {
        if (error instanceof AuthorizationError) {
          console.error('   ⚠️  Access denied: You don\'t have permission to view this project');
        } else {
          console.error('   ❌ Failed to get project:', error);
        }
      }
      console.log();

      // Example 3: List environments for a project
      console.log(`🌍 Listing environments for project: ${projectId}...`);
      try {
        const environments = await client.environments.list({
          projectId,
        });
        console.log(`   Found ${environments.length} environment(s)`);
        for (const env of environments) {
          console.log(
            `   - ${env.name} (${env.slug}) - ${env.protected ? '🔒 Protected' : '🔓 Not protected'}`
          );
        }
      } catch (error) {
        console.error('   ❌ Failed to list environments:', error);
      }
      console.log();

      // Example 4: List secrets (if environment ID is provided)
      const environmentId = process.env.ENVASE_ENVIRONMENT_ID;
      if (environmentId) {
        console.log(`🔐 Listing secrets for environment: ${environmentId}...`);
        try {
          const secrets = await client.secrets.list({
            projectId,
            environmentId,
          });
          console.log(`   Found ${secrets.length} secret(s)`);
          for (const secret of secrets.slice(0, 5)) {
            console.log(`   - ${secret.key} (scope: ${secret.scope})`);
          }
          if (secrets.length > 5) {
            console.log(`   ... and ${secrets.length - 5} more`);
          }
        } catch (error) {
          if (error instanceof AuthorizationError) {
            console.error('   ⚠️  Access denied: You don\'t have permission to view secrets');
          } else {
            console.error('   ❌ Failed to list secrets:', error);
          }
        }
        console.log();
      }
    }

    // Example 5: Error handling demonstration
    console.log('🛡️  Error handling examples:');
    console.log('   The SDK throws specific error types:');
    console.log('   - AuthenticationError: Invalid or expired token');
    console.log('   - AuthorizationError: Insufficient permissions');
    console.log('   - ValidationError: Invalid input data');
    console.log('   - NetworkError: Network or server errors\n');

    console.log('✅ Example completed successfully!');
  } catch (error) {
    console.error('\n❌ Example failed:');

    if (error instanceof AuthenticationError) {
      console.error('   Authentication failed:', error.message);
      console.error('   Check your ENVASE_TOKEN environment variable');
    } else if (error instanceof AuthorizationError) {
      console.error('   Authorization failed:', error.message);
      console.error('   Check your token permissions');
    } else if (error instanceof ValidationError) {
      console.error('   Validation failed:', error.message);
      if (error.details.length > 0) {
        console.error('   Details:');
        for (const detail of error.details) {
          console.error(`     - ${detail.field}: ${detail.message}`);
        }
      }
    } else if (error instanceof NetworkError) {
      console.error('   Network error:', error.message);
      console.error(`   Status code: ${error.statusCode || 'unknown'}`);
    } else if (error instanceof Error) {
      console.error('   Error:', error.message);
    } else {
      console.error('   Unknown error:', error);
    }

    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

