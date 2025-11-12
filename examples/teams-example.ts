/**
 * Teams Example - Envase SDK
 *
 * This example demonstrates team management:
 * - List team members
 * - Invite team members
 * - Update member roles
 * - Remove team members
 */

import 'dotenv/config';
import { EnvaseClient } from '../src/index';
import { AuthorizationError, AuthenticationError } from '../src/index';

// Load environment variables
function loadConfig() {
  const apiUrl = process.env.ENVASE_API_URL;
  const token = process.env.ENVASE_TOKEN;
  const organization = process.env.ENVASE_ORGANIZATION;
  const projectId = process.env.ENVASE_PROJECT_ID;

  if (!apiUrl || !token) {
    throw new Error(
      'Missing required environment variables: ENVASE_API_URL and ENVASE_TOKEN'
    );
  }

  return { apiUrl, token, organization, projectId };
}

async function main() {
  try {
    const config = loadConfig();
    console.log('🔧 Configuration loaded\n');

    // Initialize the client
    const client = new EnvaseClient({
      apiUrl: config.apiUrl,
      token: config.token,
      organization: config.organization,
    });
    console.log('✅ Envase client initialized\n');

    if (!config.projectId) {
      console.log('⚠️  ENVASE_PROJECT_ID not set. Skipping team operations.\n');
      console.log('📝 To test team management, set ENVASE_PROJECT_ID in your .env file');
      return;
    }

    const projectId = config.projectId;

    // Example 1: List team members
    console.log(`👥 Listing team members for project: ${projectId}...`);
    try {
      const members = await client.teams.list({ projectId });
      console.log(`   Found ${members.length} team member(s)\n`);

      for (const member of members) {
        console.log(`   👤 ${member.name} (${member.email})`);
        console.log(`      Role: ${member.role}`);
        console.log(`      Status: ${member.status}`);
        console.log(`      ID: ${member.id}`);
        console.log();
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        console.error(
          '   ⚠️  Access denied: You don\'t have permission to view team members'
        );
      } else if (error instanceof AuthenticationError) {
        console.error('   ⚠️  Authentication failed: Check your token');
      } else {
        console.error('   ❌ Failed to list team members:', error);
      }
    }

    // Example 2: Get a specific team member (if we have members)
    console.log('📋 Getting team member details...');
    try {
      const members = await client.teams.list({ projectId });
      if (members.length > 0) {
        const firstMember = members[0];
        const member = await client.teams.get(projectId, firstMember.userId);
        console.log(`   ✅ Member: ${member.name}`);
        console.log(`   Email: ${member.email}`);
        console.log(`   Role: ${member.role}`);
        console.log(`   Status: ${member.status}\n`);
      } else {
        console.log('   ℹ️  No members to retrieve\n');
      }
    } catch (error) {
      console.error('   ❌ Failed to get team member:', error);
    }

    // Example 3: Invite a team member (commented out to avoid accidental invites)
    console.log('📧 Team member invitation example:');
    console.log('   To invite a member, uncomment the code below:');
    console.log(`
    try {
      await client.teams.invite(projectId, {
        email: 'new-member@example.com',
        role: 'developer',
        message: 'Welcome to the team!',
      });
      console.log('   ✅ Invitation sent');
    } catch (error) {
      console.error('   ❌ Failed to invite member:', error);
    }
    `);
    console.log();

    // Example 4: Update member role (commented out to avoid accidental changes)
    console.log('🔄 Team member role update example:');
    console.log('   To update a member role, uncomment the code below:');
    console.log(`
    try {
      const members = await client.teams.list({ projectId });
      if (members.length > 0) {
        const member = members[0];
        await client.teams.updateRole(projectId, member.userId, {
          role: 'read_only',
        });
        console.log('   ✅ Role updated');
      }
    } catch (error) {
      console.error('   ❌ Failed to update role:', error);
    }
    `);
    console.log();

    // Example 5: Remove team member (commented out to avoid accidental removals)
    console.log('🗑️  Team member removal example:');
    console.log('   To remove a member, uncomment the code below:');
    console.log(`
    try {
      const members = await client.teams.list({ projectId });
      if (members.length > 0) {
        const member = members[0];
        await client.teams.remove(projectId, member.userId);
        console.log('   ✅ Member removed');
      }
    } catch (error) {
      console.error('   ❌ Failed to remove member:', error);
    }
    `);
    console.log();

    console.log('✅ Teams example completed!');
    console.log('\n📝 Notes:');
    console.log('   - Team management requires appropriate permissions');
    console.log('   - Only project owners can invite/remove members');
    console.log('   - Roles: owner, developer, read_only');
    console.log('   - Uncomment the code above to test write operations');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

